// Habit colors for UI
export const HABIT_COLORS = [
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
  { name: "Yellow", value: "#eab308", class: "bg-yellow-500" },
  { name: "Green", value: "#22c55e", class: "bg-green-500" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
];

// Static fallback quotes (50+ motivational quotes)
export const STATIC_QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { quote: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { quote: "The difference between who you are and who you want to be is what you do.", author: "Charles Duhigg" },
  { quote: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { quote: "Success doesn't come from what you do occasionally, it comes from what you do consistently.", author: "Marie Forleo" },
  { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { quote: "Dream bigger. Do bigger.", author: "Unknown" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { quote: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { quote: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { quote: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { quote: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { quote: "You'll never change your life until you change something you do daily.", author: "John C. Maxwell" },
  { quote: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { quote: "The chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson" },
  { quote: "Good habits are worth being fanatical about.", author: "John Irving" },
  { quote: "Drop by drop is the water pot filled.", author: "Buddha" },
  { quote: "An ounce of action is worth a ton of theory.", author: "Ralph Waldo Emerson" },
  { quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { quote: "You can't build a reputation on what you're going to do.", author: "Henry Ford" },
  { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn" },
  { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { quote: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { quote: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { quote: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { quote: "Try not to become a person of success, but rather try to become a person of value.", author: "Albert Einstein" },
  { quote: "It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change.", author: "Charles Darwin" },
  { quote: "The mind is everything. What you think you become.", author: "Buddha" },
  { quote: "The best revenge is massive success.", author: "Frank Sinatra" },
  { quote: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { quote: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { quote: "The person who says it cannot be done should not interrupt the person who is doing it.", author: "Chinese Proverb" },
];

// Todo priorities
export const TODO_PRIORITIES = [
  { value: "low", label: "Low", color: "gray" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "red" },
] as const;

// Habit frequencies
export const HABIT_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom Days" },
] as const;

// Days of week for custom frequency
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun", fullLabel: "Sunday" },
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
];

// Expense categories with icons and colors
export const EXPENSE_CATEGORIES = [
  { value: "Food & Dining", label: "Food & Dining", icon: "🍽️", color: "#f97316" },
  { value: "Groceries", label: "Groceries", icon: "🛒", color: "#84cc16" },
  { value: "Transport", label: "Transport", icon: "🚗", color: "#3b82f6" },
  { value: "Shopping", label: "Shopping", icon: "🛍️", color: "#ec4899" },
  { value: "Entertainment", label: "Entertainment", icon: "🎬", color: "#a855f7" },
  { value: "Bills & Utilities", label: "Bills & Utilities", icon: "💡", color: "#eab308" },
  { value: "Healthcare", label: "Healthcare", icon: "🏥", color: "#ef4444" },
  { value: "Education", label: "Education", icon: "📚", color: "#06b6d4" },
  { value: "Travel", label: "Travel", icon: "✈️", color: "#8b5cf6" },
  { value: "Personal Care", label: "Personal Care", icon: "💅", color: "#d946ef" },
  { value: "Gifts", label: "Gifts", icon: "🎁", color: "#f43f5e" },
  { value: "Investments", label: "Investments", icon: "📈", color: "#10b981" },
  { value: "Other", label: "Other", icon: "📦", color: "#6b7280" },
] as const;

// Payment modes
export const PAYMENT_MODES = [
  { value: "Cash", label: "Cash", icon: "💵" },
  { value: "Card", label: "Card", icon: "💳" },
  { value: "UPI", label: "UPI", icon: "📱" },
  { value: "Wallet", label: "Wallet", icon: "👛" },
] as const;

// Necessity levels
export const NECESSITY_LEVELS = [
  { value: "necessary", label: "Necessary", description: "Essential for daily living", color: "#10b981" },
  { value: "avoidable", label: "Avoidable", description: "Could have been postponed", color: "#eab308" },
  { value: "optional", label: "Optional", description: "Nice to have", color: "#f97316" },
  { value: "luxury", label: "Luxury", description: "Premium/indulgent", color: "#a855f7" },
] as const;

// Savings potential
export const SAVINGS_POTENTIAL = [
  { value: "none", label: "None", description: "No savings possible", color: "#6b7280" },
  { value: "low", label: "Low", description: "Minimal savings (< 10%)", color: "#84cc16" },
  { value: "medium", label: "Medium", description: "Moderate savings (10-30%)", color: "#eab308" },
  { value: "high", label: "High", description: "Significant savings (> 30%)", color: "#ef4444" },
] as const;

// Emotion tags
export const EMOTION_TAGS = [
  { value: "neutral", label: "Neutral", icon: "😐", color: "#6b7280" },
  { value: "happy", label: "Happy", icon: "😊", color: "#10b981" },
  { value: "stress", label: "Stress", icon: "😰", color: "#ef4444" },
  { value: "impulse", label: "Impulse", icon: "⚡", color: "#f97316" },
  { value: "celebration", label: "Celebration", icon: "🎉", color: "#a855f7" },
  { value: "regret", label: "Regret", icon: "😔", color: "#64748b" },
] as const;

// Expense intents
export const EXPENSE_INTENTS = [
  { value: "survival", label: "Survival", description: "Basic needs", icon: "🏠" },
  { value: "comfort", label: "Comfort", description: "Convenience & ease", icon: "🛋️" },
  { value: "growth", label: "Growth", description: "Personal development", icon: "🌱" },
  { value: "social", label: "Social", description: "Relationships & connections", icon: "👥" },
  { value: "entertainment", label: "Entertainment", description: "Fun & leisure", icon: "🎮" },
  { value: "status", label: "Status", description: "Image & prestige", icon: "👑" },
] as const;

// Recurring types
export const RECURRING_TYPES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

// Milestone definitions
export const STREAK_MILESTONES = [
  { key: "streak_3", type: "streak" as const, value: 3, title: "3 Day Streak", description: "Complete a habit for 3 consecutive days", icon: "🔥" },
  { key: "streak_7", type: "streak" as const, value: 7, title: "Week Warrior", description: "Complete a habit for 7 consecutive days", icon: "⚡" },
  { key: "streak_14", type: "streak" as const, value: 14, title: "Two Weeks Strong", description: "Complete a habit for 14 consecutive days", icon: "💪" },
  { key: "streak_21", type: "streak" as const, value: 21, title: "Habit Former", description: "Complete a habit for 21 consecutive days", icon: "🌟" },
  { key: "streak_30", type: "streak" as const, value: 30, title: "Month Master", description: "Complete a habit for 30 consecutive days", icon: "👑" },
  { key: "streak_66", type: "streak" as const, value: 66, title: "Habit Legend", description: "Complete a habit for 66 consecutive days", icon: "🏆" },
  { key: "streak_100", type: "streak" as const, value: 100, title: "Century Club", description: "Complete a habit for 100 consecutive days", icon: "💎" },
] as const;

export const COMPLETION_MILESTONES = [
  { key: "total_10", type: "total_completions" as const, value: 10, title: "Getting Started", description: "Complete 10 habit tasks", icon: "🎯" },
  { key: "total_25", type: "total_completions" as const, value: 25, title: "Quarter Century", description: "Complete 25 habit tasks", icon: "🌱" },
  { key: "total_50", type: "total_completions" as const, value: 50, title: "Half Century", description: "Complete 50 habit tasks", icon: "🚀" },
  { key: "total_100", type: "total_completions" as const, value: 100, title: "Centurion", description: "Complete 100 habit tasks", icon: "⭐" },
  { key: "total_250", type: "total_completions" as const, value: 250, title: "Elite Performer", description: "Complete 250 habit tasks", icon: "🎖️" },
  { key: "total_500", type: "total_completions" as const, value: 500, title: "Master", description: "Complete 500 habit tasks", icon: "🥇" },
  { key: "total_1000", type: "total_completions" as const, value: 1000, title: "Grand Master", description: "Complete 1000 habit tasks", icon: "👑" },
] as const;

export const CONSISTENCY_MILESTONES = [
  { key: "perfect_week", type: "consistency" as const, value: 7, title: "Perfect Week", description: "Complete all habits for 7 consecutive days", icon: "✨" },
  { key: "comeback", type: "consistency" as const, value: 1, title: "Comeback King", description: "Return after a 30+ day break and complete 7 consecutive days", icon: "🎪" },
] as const;

export const GLOBAL_MILESTONES = [
  { key: "first_habit", type: "global" as const, value: 1, title: "First Step", description: "Create your first habit", icon: "🌟" },
  { key: "five_habits", type: "global" as const, value: 5, title: "Daily Stacker", description: "Create 5 habits", icon: "🏗️" },
] as const;
