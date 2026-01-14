let lastEventCount = 0;
let currentTab = 'timeline';

// Category colors for visualization
const CATEGORY_COLORS = {
  work: '#3b82f6',
  health: '#10b981',
  food: '#f59e0b',
  learning: '#8b5cf6',
  social: '#ec4899',
  entertainment: '#06b6d4',
  personal: '#6366f1',
  creative: '#f97316',
  uncategorized: '#6b7280'
};

// Category icons
const CATEGORY_ICONS = {
  work: '💼',
  health: '💪',
  food: '🍽️',
  learning: '📚',
  social: '👥',
  entertainment: '🎮',
  personal: '🏠',
  creative: '🎨',
  uncategorized: '📝'
};

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

// Button loading state helper - uses CSS dots animation
function setButtonLoading(button, isLoading, originalText) {
  if (isLoading) {
    button.disabled = true;
    button.classList.add("btn-loading");
    button.dataset.originalText = button.textContent;
  } else {
    button.disabled = false;
    button.classList.remove("btn-loading");
    button.textContent = originalText || button.dataset.originalText;
  }
}

async function addEvent() {
  const labelInput = document.getElementById("label");
  const label = labelInput.value.trim();
  const button = document.getElementById("logBtn") || document.querySelector(".log-btn");

  if (!label) {
    showNotification("Please enter what you did", "error");
    labelInput.focus();
    return;
  }

  // Show loading state
  setButtonLoading(button, true);

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
      showNotification("✓ Event logged!", "success");
      loadTimeline();
    } else {
      showNotification(data.error || "Failed to log event", "error");
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error");
  } finally {
    setButtonLoading(button, false, "Log");
    labelInput.focus();
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

// Tab switching
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Update tab content
  document.getElementById('timelineTab').classList.toggle('hidden', tab !== 'timeline');
  document.getElementById('timelineTab').classList.toggle('active', tab === 'timeline');
  document.getElementById('analysisTab').classList.toggle('hidden', tab !== 'analysis');
  document.getElementById('analysisTab').classList.toggle('active', tab === 'analysis');
  document.getElementById('historyTab').classList.toggle('hidden', tab !== 'history');
  document.getElementById('historyTab').classList.toggle('active', tab === 'history');
  
  // Load data when switching tabs
  if (tab === 'analysis') {
    loadAnalysis();
  } else if (tab === 'history') {
    loadHistory();
  }
}

// Load analysis data
async function loadAnalysis() {
  try {
    const res = await fetch('/api/analysis/today', {
      credentials: 'same-origin'
    });
    
    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    
    if (!res.ok) {
      throw new Error('Failed to load analysis');
    }
    
    const analysis = await res.json();
    renderAnalysis(analysis);
  } catch (error) {
    console.error('Error loading analysis:', error);
    showNotification('Failed to load analysis', 'error');
  }
}

// Render analysis data
function renderAnalysis(analysis) {
  // Productivity Score
  const scoreEl = document.getElementById('productivityScore');
  const scoreCircle = document.getElementById('scoreCircle');
  
  if (scoreEl && analysis.productivityScore !== undefined) {
    scoreEl.textContent = analysis.productivityScore;
    
    // Color based on score
    let scoreColor = '#ef4444'; // red
    if (analysis.productivityScore >= 70) scoreColor = '#10b981'; // green
    else if (analysis.productivityScore >= 40) scoreColor = '#f59e0b'; // yellow
    
    scoreCircle.style.borderColor = scoreColor;
    scoreCircle.style.boxShadow = `0 0 20px ${scoreColor}40`;
  }
  
  // Category Breakdown
  const categoriesList = document.getElementById('categoriesList');
  if (categoriesList) {
    if (analysis.categories && analysis.categories.length > 0) {
      categoriesList.innerHTML = analysis.categories
        .filter(cat => cat.count > 0)
        .map(cat => `
          <div class="category-item">
            <div class="category-info">
              <span class="category-icon">${CATEGORY_ICONS[cat.category] || '📝'}</span>
              <span class="category-name">${escapeHtml(cat.category)}</span>
            </div>
            <div class="category-stats">
              <span class="category-count">${cat.count} events</span>
              <div class="category-bar">
                <div class="category-bar-fill" style="width: ${cat.percentage}%; background: ${CATEGORY_COLORS[cat.category] || '#6b7280'}"></div>
              </div>
              <span class="category-percentage">${cat.percentage}%</span>
            </div>
          </div>
        `).join('');
    } else {
      categoriesList.innerHTML = '<p class="empty-hint">No categories logged yet</p>';
    }
  }
  
  // Insights
  const insightsList = document.getElementById('insightsList');
  if (insightsList) {
    if (analysis.insights && analysis.insights.length > 0) {
      insightsList.innerHTML = analysis.insights
        .map(insight => `<li>${escapeHtml(insight)}</li>`)
        .join('');
    } else {
      insightsList.innerHTML = '<li>Log more events to get insights!</li>';
    }
  }
  
  // Recommendations
  const recommendationsList = document.getElementById('recommendationsList');
  if (recommendationsList) {
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      recommendationsList.innerHTML = analysis.recommendations
        .map(rec => `<li>${escapeHtml(rec)}</li>`)
        .join('');
    } else {
      recommendationsList.innerHTML = '<li>Keep logging to get personalized recommendations!</li>';
    }
  }
}

// Refresh analysis
async function refreshAnalysis() {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Refreshing...';
  }
  
  try {
    const res = await fetch('/api/analysis/refresh', {
      method: 'POST',
      credentials: 'same-origin'
    });
    
    if (!res.ok) throw new Error('Refresh failed');
    
    const analysis = await res.json();
    renderAnalysis(analysis);
    showNotification('Analysis updated!', 'success');
  } catch (error) {
    console.error('Refresh error:', error);
    showNotification('Failed to refresh analysis', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Refresh';
    }
  }
}

// Load history data
async function loadHistory() {
  const days = document.getElementById('historyRange')?.value || 7;
  
  try {
    const [historyRes, trendsRes] = await Promise.all([
      fetch(`/api/analysis/history?days=${days}`, { credentials: 'same-origin' }),
      fetch(`/api/analysis/trends?days=${days}`, { credentials: 'same-origin' })
    ]);
    
    if (historyRes.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    
    const history = await historyRes.json();
    const trends = await trendsRes.json();
    
    renderHistory(history, trends, parseInt(days));
  } catch (error) {
    console.error('Error loading history:', error);
    showNotification('Failed to load history', 'error');
  }
}

// Render history data
function renderHistory(history, trends, days) {
  // Calculate improvement stats
  const scores = history.map(h => h.productivityScore).filter(s => s !== undefined);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  
  // Calculate trend (compare first half to second half)
  let trendText = '➖ Stable';
  if (scores.length >= 4) {
    const halfLen = Math.floor(scores.length / 2);
    const recentAvg = scores.slice(0, halfLen).reduce((a, b) => a + b, 0) / halfLen;
    const olderAvg = scores.slice(halfLen).reduce((a, b) => a + b, 0) / (scores.length - halfLen);
    const diff = recentAvg - olderAvg;
    
    if (diff > 5) trendText = '📈 Improving';
    else if (diff < -5) trendText = '📉 Declining';
  }
  
  // Find best day
  let bestDay = '--';
  if (history.length > 0) {
    const best = history.reduce((a, b) => (a.productivityScore || 0) > (b.productivityScore || 0) ? a : b);
    if (best.date) {
      const date = new Date(best.date);
      bestDay = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }
  
  // Total events
  const totalEvents = history.reduce((sum, h) => sum + (h.totalEvents || 0), 0);
  
  // Update summary stats
  document.getElementById('avgScore').textContent = avgScore;
  document.getElementById('trendIndicator').textContent = trendText;
  document.getElementById('bestDay').textContent = bestDay;
  document.getElementById('totalEvents').textContent = totalEvents;
  
  // Style avg score color
  const avgScoreEl = document.getElementById('avgScore');
  if (avgScore >= 70) avgScoreEl.style.color = '#10b981';
  else if (avgScore >= 40) avgScoreEl.style.color = '#f59e0b';
  else avgScoreEl.style.color = '#ef4444';
  
  // Render score chart (simple bar chart)
  const chartContainer = document.getElementById('scoreChart');
  if (chartContainer && history.length > 0) {
    const reversedHistory = [...history].reverse(); // Oldest first for chart
    const maxScore = 100;
    
    chartContainer.innerHTML = `
      <div class="chart-bars">
        ${reversedHistory.slice(-14).map(day => {
          const score = day.productivityScore || 0;
          const height = (score / maxScore) * 100;
          const date = new Date(day.date);
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          let barColor = '#ef4444';
          if (score >= 70) barColor = '#10b981';
          else if (score >= 40) barColor = '#f59e0b';
          
          return `
            <div class="chart-bar-wrapper" title="${dateLabel}: ${score}">
              <div class="chart-bar" style="height: ${height}%; background: ${barColor};">
                <span class="chart-bar-value">${score}</span>
              </div>
              <span class="chart-bar-label">${dayLabel}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (chartContainer) {
    chartContainer.innerHTML = '<p class="empty-hint">Log events for a few days to see your trend!</p>';
  }
  
  // Render category trends
  const trendsList = document.getElementById('trendsList');
  if (trendsList && trends.length > 0) {
    trendsList.innerHTML = trends.slice(0, 5).map((trend, index) => `
      <div class="trend-item">
        <span class="trend-rank">#${index + 1}</span>
        <span class="trend-icon">${CATEGORY_ICONS[trend.category] || '📝'}</span>
        <span class="trend-name">${escapeHtml(trend.category)}</span>
        <span class="trend-stats">${trend.totalCount} events (avg ${trend.avgPerDay}/day)</span>
      </div>
    `).join('');
  } else if (trendsList) {
    trendsList.innerHTML = '<p class="empty-hint">No category data yet</p>';
  }
  
  // Render daily history list
  const historyList = document.getElementById('historyList');
  if (historyList && history.length > 0) {
    historyList.innerHTML = history.map(day => {
      const date = new Date(day.date);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      const score = day.productivityScore || 0;
      const topCat = day.topCategory || 'none';
      
      let scoreClass = 'score-low';
      if (score >= 70) scoreClass = 'score-high';
      else if (score >= 40) scoreClass = 'score-medium';
      
      return `
        <div class="history-item">
          <div class="history-date">${dateStr}</div>
          <div class="history-details">
            <span class="history-events">${day.totalEvents || 0} events</span>
            <span class="history-top-cat">${CATEGORY_ICONS[topCat] || ''} ${topCat}</span>
          </div>
          <div class="history-score ${scoreClass}">${score}</div>
        </div>
      `;
    }).join('');
  } else if (historyList) {
    historyList.innerHTML = '<p class="empty-hint">No history yet. Start logging events daily!</p>';
  }
}