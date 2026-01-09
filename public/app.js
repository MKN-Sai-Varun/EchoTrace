let lastEventCount = 0;

// XSS protection helper
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Notification system
function showNotification(message, type = "success") {
  // Remove existing notifications
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-message">${escapeHtml(message)}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => notification.remove(), 4000);
}

async function addEvent() {
  const labelInput = document.getElementById("label");
  const label = labelInput.value.trim();
  const button = document.querySelector(".log-btn");

  if (!label) {
    showNotification("Please enter what you did", "error");
    return;
  }

  // Disable button during request
  button.disabled = true;
  button.textContent = "Logging...";

  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({ label })
    });

    const data = await res.json();

    if (res.ok) {
      labelInput.value = "";
      showNotification("Event logged successfully!", "success");
      loadTimeline();
    } else {
      showNotification(data.error || "Failed to log event", "error");
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Log";
  }
}

async function loadTimeline() {
  try {
    const res = await fetch("/api/events/today", {
      credentials: "same-origin"
    });

    if (res.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to load events");
    }

    const events = await res.json();

    const timeline = document.getElementById("timeline");
    const isNewEvent = events.length > lastEventCount;
    lastEventCount = events.length;

    if (events.length === 0) {
      timeline.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No events logged today</p>
          <p class="empty-hint">Start by logging what you're doing!</p>
        </div>
      `;
      return;
    }

    timeline.innerHTML = events
      .map(
        (event, index) => `
      <div class="timeline-item ${isNewEvent && index === 0 ? "new-item" : ""}">
        <div class="timeline-time">${new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        <div class="timeline-label">${escapeHtml(event.label)}</div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading timeline:", error);
    showNotification("Failed to load timeline", "error");
  }
}

// Allow Enter key to submit
document.addEventListener("DOMContentLoaded", () => {
  const labelInput = document.getElementById("label");
  if (labelInput) {
    labelInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addEvent();
      }
    });
  }
});

loadTimeline();