
let lastEventCount = 0;

async function addEvent() {
  const labelInput = document.getElementById("label");
  const label = labelInput.value.trim();

  if (!label) return;

  await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify({ label })
  });

  labelInput.value = "";
  loadTimeline();
}

async function loadTimeline() {
  const res = await fetch("/api/events/today", {
    credentials: "same-origin"
  });

  if (res.status === 401) {
    window.location.href = "/login.html";
    return;
  }

  const events = await res.json();
  
  const timeline = document.getElementById("timeline");
  const isNewEvent = events.length > lastEventCount;
  lastEventCount = events.length;

  timeline.innerHTML = events.map((event, index) => `
    <div class="timeline-item ${isNewEvent && index === 0 ? 'new-item' : ''}">
      <div class="timeline-time">${new Date(event.timestamp).toLocaleTimeString()}</div>
      <div class="timeline-label">${event.label}</div>
    </div>
  `).join('');
}

loadTimeline();