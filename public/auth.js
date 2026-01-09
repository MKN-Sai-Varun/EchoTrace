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

  // Auto-remove after 5 seconds
  setTimeout(() => notification.remove(), 5000);
}

// XSS protection helper
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function login() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const button = document.querySelector("button");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showNotification("Please enter username and password", "error");
    return;
  }

  // Disable button during request
  button.disabled = true;
  button.textContent = "Logging in...";

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      showNotification("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      showNotification(data.error || "Login failed", "error");
      button.disabled = false;
      button.textContent = "Login";
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
    button.disabled = false;
    button.textContent = "Login";
  }
}

async function register() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const button = document.querySelector("button");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showNotification("Please enter username and password", "error");
    return;
  }

  if (username.length < 3) {
    showNotification("Username must be at least 3 characters", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    return;
  }

  // Disable button during request
  button.disabled = true;
  button.textContent = "Creating account...";

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      showNotification("Account created! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      showNotification(data.error || "Registration failed", "error");
      button.disabled = false;
      button.textContent = "Register";
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
    button.disabled = false;
    button.textContent = "Register";
  }
}

// Allow Enter key to submit forms
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        // Determine if we're on login or register page
        if (window.location.pathname.includes("register")) {
          register();
        } else {
          login();
        }
      }
    });
  }
});
