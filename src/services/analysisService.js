import Event from "../models/Event.js";
import Analysis from "../models/Analysis.js";

// Category keywords for auto-detection
const CATEGORY_KEYWORDS = {
  work: ["meeting", "email", "call", "project", "task", "deadline", "report", "presentation", "client", "office", "code", "coding", "debug", "review", "deploy"],
  health: ["exercise", "gym", "workout", "run", "walk", "yoga", "meditate", "meditation", "sleep", "nap", "doctor", "medicine", "vitamins", "stretch"],
  food: ["breakfast", "lunch", "dinner", "snack", "coffee", "tea", "eat", "cook", "meal", "food", "drink", "water"],
  learning: ["read", "study", "course", "tutorial", "learn", "practice", "book", "article", "podcast", "video", "research"],
  social: ["friend", "family", "call", "chat", "meet", "party", "hangout", "date", "visit", "talk"],
  entertainment: ["movie", "show", "game", "gaming", "music", "youtube", "netflix", "scroll", "browse", "relax"],
  personal: ["shower", "hygiene", "clean", "organize", "laundry", "errands", "shopping", "commute", "travel"],
  creative: ["write", "draw", "design", "create", "build", "art", "photo", "video", "edit", "brainstorm"]
};

// Productivity weights for categories (higher = more productive)
const PRODUCTIVITY_WEIGHTS = {
  work: 1.0,
  learning: 0.9,
  health: 0.85,
  creative: 0.8,
  personal: 0.6,
  food: 0.5,
  social: 0.5,
  entertainment: 0.3,
  uncategorized: 0.4
};

/**
 * Auto-detect category from event label
 */
function detectCategory(label) {
  const lowerLabel = label.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerLabel.includes(keyword)) {
        return category;
      }
    }
  }
  
  return "uncategorized";
}

/**
 * Generate insights based on category breakdown
 */
function generateInsights(categories, totalEvents) {
  const insights = [];
  
  if (totalEvents === 0) {
    insights.push("No events logged today. Start tracking to get insights!");
    return insights;
  }
  
  // Find top category
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);
  const topCategory = sortedCategories[0];
  
  if (topCategory) {
    insights.push(`Your main focus today was "${topCategory.category}" with ${topCategory.count} activities (${topCategory.percentage}%)`);
  }
  
  // Check for balance
  const categoryCount = categories.filter(c => c.count > 0).length;
  if (categoryCount >= 4) {
    insights.push("Great variety! You balanced multiple areas of your life today.");
  } else if (categoryCount <= 2 && totalEvents > 5) {
    insights.push("Consider diversifying your activities for better work-life balance.");
  }
  
  // Health check
  const healthCategory = categories.find(c => c.category === "health");
  if (healthCategory && healthCategory.count >= 2) {
    insights.push("Excellent focus on health and wellness today! 💪");
  } else if (!healthCategory || healthCategory.count === 0) {
    insights.push("No health activities logged. Consider adding exercise or meditation.");
  }
  
  // Work patterns
  const workCategory = categories.find(c => c.category === "work");
  if (workCategory && workCategory.percentage > 60) {
    insights.push("Heavy work day! Remember to take breaks and recharge.");
  }
  
  // Entertainment check
  const entertainmentCategory = categories.find(c => c.category === "entertainment");
  if (entertainmentCategory && entertainmentCategory.percentage > 40) {
    insights.push("Lots of entertainment time today. Balance is key!");
  }
  
  // Learning
  const learningCategory = categories.find(c => c.category === "learning");
  if (learningCategory && learningCategory.count > 0) {
    insights.push("Great job investing in learning! Knowledge compounds over time. 📚");
  }
  
  return insights.slice(0, 5); // Max 5 insights
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(categories, totalEvents, date) {
  const recommendations = [];
  
  if (totalEvents === 0) {
    recommendations.push("Start your day by logging your first activity!");
    return recommendations;
  }
  
  const hour = new Date().getHours();
  
  // Time-based recommendations
  if (hour >= 6 && hour < 10) {
    const healthToday = categories.find(c => c.category === "health")?.count || 0;
    if (healthToday === 0) {
      recommendations.push("Morning is a great time for exercise or meditation!");
    }
  }
  
  if (hour >= 14 && hour < 16) {
    recommendations.push("Afternoon slump? Try a short walk or stretch break.");
  }
  
  // Category-based recommendations
  const workCount = categories.find(c => c.category === "work")?.count || 0;
  const healthCount = categories.find(c => c.category === "health")?.count || 0;
  const learningCount = categories.find(c => c.category === "learning")?.count || 0;
  const socialCount = categories.find(c => c.category === "social")?.count || 0;
  
  if (workCount > 5 && healthCount === 0) {
    recommendations.push("You've been working hard! Take a break for some physical activity.");
  }
  
  if (learningCount === 0 && totalEvents > 3) {
    recommendations.push("Consider dedicating 15-30 minutes to learning something new.");
  }
  
  if (socialCount === 0 && totalEvents > 5) {
    recommendations.push("Connect with a friend or family member today.");
  }
  
  // General productivity tips
  if (totalEvents < 5 && hour > 12) {
    recommendations.push("Log more activities to get better insights into your day.");
  }
  
  if (totalEvents > 10) {
    recommendations.push("Very active day! Make sure to schedule some downtime.");
  }
  
  return recommendations.slice(0, 4); // Max 4 recommendations
}

/**
 * Calculate productivity score based on categories
 */
function calculateProductivityScore(categories, totalEvents) {
  if (totalEvents === 0) return 0;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const category of categories) {
    const weight = PRODUCTIVITY_WEIGHTS[category.category] || 0.4;
    weightedSum += category.count * weight;
    totalWeight += category.count;
  }
  
  const baseScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
  
  // Bonus for variety
  const varietyBonus = Math.min(categories.filter(c => c.count > 0).length * 2, 10);
  
  // Bonus for health activities
  const healthBonus = categories.find(c => c.category === "health")?.count > 0 ? 5 : 0;
  
  return Math.min(Math.round(baseScore + varietyBonus + healthBonus), 100);
}

/**
 * Analyze events for a specific day
 */
export async function analyzeDay(userId, date = new Date()) {
  // Get start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Fetch all events for the day
  const events = await Event.find({
    userId,
    timestamp: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ timestamp: 1 });
  
  // Group by category
  const categoryMap = new Map();
  
  for (const event of events) {
    const category = event.category || detectCategory(event.label);
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        count: 0,
        events: []
      });
    }
    
    const catData = categoryMap.get(category);
    catData.count++;
    catData.events.push({
      label: event.label,
      timestamp: event.timestamp
    });
  }
  
  // Calculate percentages and time estimates
  const totalEvents = events.length;
  const categories = Array.from(categoryMap.values()).map(cat => ({
    ...cat,
    percentage: totalEvents > 0 ? Math.round((cat.count / totalEvents) * 100) : 0,
    timeSpent: cat.count * 15 // Rough estimate: 15 min per logged activity
  }));
  
  // Sort by count descending
  categories.sort((a, b) => b.count - a.count);
  
  // Generate analysis
  const insights = generateInsights(categories, totalEvents);
  const recommendations = generateRecommendations(categories, totalEvents, date);
  const productivityScore = calculateProductivityScore(categories, totalEvents);
  const topCategory = categories.length > 0 ? categories[0].category : null;
  
  // Save or update analysis
  const analysis = await Analysis.findOneAndUpdate(
    { userId, date: startOfDay },
    {
      userId,
      date: startOfDay,
      totalEvents,
      categories,
      insights,
      recommendations,
      productivityScore,
      topCategory
    },
    { upsert: true, new: true }
  );
  
  return analysis;
}

/**
 * Get analysis for today
 */
export async function getTodayAnalysis(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Try to get existing analysis
  let analysis = await Analysis.findOne({ userId, date: today });
  
  // If no analysis or it's stale (more than 5 minutes old), regenerate
  if (!analysis || (Date.now() - analysis.updatedAt.getTime()) > 5 * 60 * 1000) {
    analysis = await analyzeDay(userId, today);
  }
  
  return analysis;
}

/**
 * Get analysis history
 */
export async function getAnalysisHistory(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  return Analysis.find({
    userId,
    date: { $gte: startDate }
  }).sort({ date: -1 });
}

/**
 * Get category stats over time
 */
export async function getCategoryTrends(userId, days = 7) {
  const analyses = await getAnalysisHistory(userId, days);
  
  const categoryTotals = new Map();
  
  for (const analysis of analyses) {
    for (const cat of analysis.categories) {
      if (!categoryTotals.has(cat.category)) {
        categoryTotals.set(cat.category, { count: 0, days: 0 });
      }
      const totals = categoryTotals.get(cat.category);
      totals.count += cat.count;
      totals.days++;
    }
  }
  
  return Array.from(categoryTotals.entries())
    .map(([category, data]) => ({
      category,
      totalCount: data.count,
      avgPerDay: Math.round(data.count / data.days * 10) / 10,
      daysActive: data.days
    }))
    .sort((a, b) => b.totalCount - a.totalCount);
}
