/**
 * Service for communicating with the Hugging Face Inference API.
 * 
 * HF Inference API format:
 *   POST https://api-inference.huggingface.co/models/{model_id}
 *   Body: { "inputs": "<prompt>", "parameters": { ... } }
 *   Response: [{ "generated_text": "..." }]
 */

/**
 * Builds the Phi-3 / Llama-3 style prompt from messages array.
 * Matches the <|system|>...<|end|> format used in echotrace_train.jsonl
 */
function buildPrompt(messages) {
  return messages.map(m => {
    if (m.role === "system") return `<|system|>\n${m.content}<|end|>`;
    if (m.role === "user")   return `<|user|>\n${m.content}<|end|>`;
    if (m.role === "assistant") return `<|assistant|>\n${m.content}<|end|>`;
    return m.content;
  }).join("\n") + "\n<|assistant|>\n";
}

/**
 * Extracts only the assistant's new response from the full generated text.
 * The model may echo back the prompt, so we grab just what comes after the last <|assistant|>.
 */
function extractAssistantReply(generatedText) {
  const marker = "<|assistant|>";
  const lastIdx = generatedText.lastIndexOf(marker);
  if (lastIdx !== -1) {
    return generatedText.slice(lastIdx + marker.length).replace(/<\|end\|>.*$/s, "").trim();
  }
  return generatedText.trim();
}

async function callAiModel(messages) {
  const modelUrl = process.env.AI_MODEL_URL;

  if (!modelUrl) {
    throw new Error("AI_MODEL_URL is not configured in the environment.");
  }

  const headers = {
    "Content-Type": "application/json"
  };

  if (process.env.AI_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.AI_API_KEY}`;
  }

  const prompt = buildPrompt(messages);

  const body = {
    inputs: prompt,
    parameters: {
      max_new_tokens: 512,
      temperature: 0.3,        // Low temperature for consistent JSON output
      return_full_text: true,  // HF returns the prompt + generation
      do_sample: true,
      stop: ["<|end|>", "<|user|>"] // Stop before a new turn begins
    }
  };

  console.log("[aiService] Calling HF API:", modelUrl);

  const response = await fetch(modelUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF API Error (${response.status}): ${errorText}`);
  }

  // HF returns: [{ "generated_text": "..." }]
  const data = await response.json();
  console.log("[aiService] Raw HF response:", JSON.stringify(data).slice(0, 300));

  let rawText = "";
  if (Array.isArray(data) && data[0]?.generated_text) {
    rawText = data[0].generated_text;
  } else if (data.generated_text) {
    rawText = data.generated_text;
  } else {
    throw new Error("Unexpected HF response format: " + JSON.stringify(data));
  }

  const replyText = extractAssistantReply(rawText);
  console.log("[aiService] Extracted reply:", replyText.slice(0, 200));

  return replyText;
}

/**
 * Parses the extracted text into JSON, with fallback for trailing garbage.
 */
function parseJsonReply(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract a JSON block from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not extract JSON from model reply: " + text.slice(0, 100));
  }
}

export async function getAiAnalysis(events) {
  const messages = [
    {
      role: "system",
      content: "You are the EchoTrace AI assistant. Your role is to analyze the user's daily activities, provide productivity scores (0-100), and chat with the user about their habits. Return strict JSON when asked to 'Analyze my day'."
    },
    {
      role: "user",
      content: `Analyze my day: ${JSON.stringify(events)}`
    }
  ];

  const replyText = await callAiModel(messages);
  return parseJsonReply(replyText);
}

export async function getAiCategory(eventLabel) {
  // If AI is not configured, fall back to keyword matching immediately
  if (!process.env.AI_MODEL_URL) {
    return keywordFallback(eventLabel);
  }

  try {
    const messages = [
      {
        role: "system",
        content: "You categorize single events into: Work, Health, Food, Learning, Social, Entertainment, Personal, or Uncategorized. Return strict JSON."
      },
      {
        role: "user",
        content: `Categorize: '${eventLabel}'`
      }
    ];

    const replyText = await callAiModel(messages);
    const parsed = parseJsonReply(replyText);

    // Ensure color/dot are present (model may only return category)
    return enrichWithColors(parsed);
  } catch (error) {
    console.error("[aiService] Category error, using fallback:", error.message);
    return keywordFallback(eventLabel);
  }
}

function enrichWithColors(parsed) {
  const colorMap = {
    Work:          { color: "bg-blue-100 text-blue-600",     dot: "bg-blue-500" },
    Health:        { color: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" },
    Social:        { color: "bg-orange-100 text-orange-600",  dot: "bg-orange-500" },
    Learning:      { color: "bg-purple-100 text-purple-600",  dot: "bg-purple-500" },
    Food:          { color: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-500" },
    Entertainment: { color: "bg-pink-100 text-pink-600",      dot: "bg-pink-500" },
    Personal:      { color: "bg-cyan-100 text-cyan-700",      dot: "bg-cyan-500" },
    Recovery:      { color: "bg-teal-100 text-teal-700",      dot: "bg-teal-500" },
    Creative:      { color: "bg-violet-100 text-violet-600",  dot: "bg-violet-500" },
    Uncategorized: { color: "bg-slate-100 text-slate-600",    dot: "bg-slate-500" },
  };
  const cat = parsed.category || "Uncategorized";
  const defaults = colorMap[cat] || colorMap.Uncategorized;
  return { category: cat, color: parsed.color || defaults.color, dot: parsed.dot || defaults.dot };
}

function keywordFallback(label) {
  const lowerInput = label.toLowerCase();
  if (/(work|meeting|email|project|cod|call|zoom|sync|review|task)/i.test(lowerInput))
    return { category: "Work", color: "bg-blue-100 text-blue-600", dot: "bg-blue-500" };
  if (/(run|walk|gym|exercise|workout|sleep|lunch|dinner|breakfast|health|meditat)/i.test(lowerInput))
    return { category: "Health", color: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" };
  if (/(friend|chat|hangout|party|family|social|date)/i.test(lowerInput))
    return { category: "Social", color: "bg-orange-100 text-orange-600", dot: "bg-orange-500" };
  return { category: "Uncategorized", color: "bg-slate-100 text-slate-600", dot: "bg-slate-500" };
}
