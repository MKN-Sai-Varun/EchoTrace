/**
 * Normalize AI chat text for plain-text UI (no markdown renderer).
 */
export function cleanChatText(raw) {
  if (raw == null) return "";
  if (typeof raw !== "string") return String(raw);

  let text = raw.trim();

  // Fenced code blocks → inner text only
  text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, "$1");

  // Inline code
  text = text.replace(/`([^`]+)`/g, "$1");

  // Headers, blockquotes
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^>\s+/gm, "");

  // Bold / italic (order matters)
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/\*([^*\n]+)\*/g, "$1");
  text = text.replace(/_([^_\n]+)_/g, "$1");

  // Links: [label](url) → label
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // List markers → simple bullet
  text = text.replace(/^\s*[-*+]\s+/gm, "• ");
  text = text.replace(/^\s*\d+\.\s+/gm, "• ");

  // HTML tags if model emits them
  text = text.replace(/<[^>]+>/g, "");

  // Escape artifacts / control / zero-width chars
  text = text.replace(/\\([*_`#[\]])/g, "$1");
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // Normalize whitespace
  text = text.replace(/[^\S\n]{2,}/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
