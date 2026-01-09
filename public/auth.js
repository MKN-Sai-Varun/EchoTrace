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

// Show loading state on button - uses CSS dots animation
function setButtonLoading(button, isLoading, originalText) {
  if (isLoading) {
    button.disabled = true;
    button.classList.add("btn-loading");
    button.dataset.originalText = button.textContent;
    // Keep text but make it transparent (CSS handles the animation)
  } else {
    button.disabled = false;
    button.classList.remove("btn-loading");
    button.textContent = originalText || button.dataset.originalText;
  }
}

async function login() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const button = document.getElementById("loginBtn") || document.querySelector("button");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showNotification("Please enter username and password", "error");
    usernameInput.focus();
    return;
  }

  // Show loading state
  setButtonLoading(button, true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      showNotification(`Welcome back, ${username}! Redirecting...`, "success");
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      showNotification(data.error || "Login failed", "error");
      setButtonLoading(button, false, "Sign In");
      passwordInput.value = "";
      passwordInput.focus();
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
    setButtonLoading(button, false, "Sign In");
  }
}

async function register() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("termsAccepted");
  const emailInput = document.getElementById("email");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const button = document.getElementById("registerBtn") || document.querySelector("button");

  const username = usernameInput?.value.trim();
  const password = passwordInput?.value;
  const confirmPassword = confirmPasswordInput?.value;
  const email = emailInput?.value.trim();
  const firstName = firstNameInput?.value.trim();
  const lastName = lastNameInput?.value.trim();

  // Validation
  if (!username || !password) {
    showNotification("Please enter username and password", "error");
    usernameInput?.focus();
    return;
  }

  if (username.length < 3) {
    showNotification("Username must be at least 3 characters", "error");
    usernameInput?.focus();
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showNotification("Username can only contain letters, numbers, and underscores", "error");
    usernameInput?.focus();
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    passwordInput?.focus();
    return;
  }

  if (confirmPasswordInput && password !== confirmPassword) {
    showNotification("Passwords do not match", "error");
    confirmPasswordInput?.focus();
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showNotification("Please enter a valid email address", "error");
    emailInput?.focus();
    return;
  }

  if (termsCheckbox && !termsCheckbox.checked) {
    showNotification("Please accept the Terms of Service", "error");
    return;
  }

  // Show loading state
  setButtonLoading(button, true);

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        username, 
        password,
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      })
    });

    const data = await res.json();

    if (res.ok) {
      const displayName = firstName || username;
      showNotification(`Welcome, ${displayName}! Your account is ready.`, "success");
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      showNotification(data.error || "Registration failed", "error");
      setButtonLoading(button, false, "Create Account");
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
    setButtonLoading(button, false, "Create Account");
  }
}

// Allow Enter key to submit forms
document.addEventListener("DOMContentLoaded", () => {
  // Handle form submission with Enter key
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });
  });
});
