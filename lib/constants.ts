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

// Milestone definitions with progressive difficulty
export const STREAK_MILESTONES = [
  { key: "streak_1", value: 1, name: "First Step", emoji: "🔥", description: "You've started your journey!" },
  { key: "streak_3", value: 3, name: "Getting Started", emoji: "⭐", description: "Three days strong!" },
  { key: "streak_7", value: 7, name: "Building Momentum", emoji: "💪", description: "One week streak! You're on fire!" },
  { key: "streak_21", value: 21, name: "Committed", emoji: "🎯", description: "Three weeks of dedication!" },
  { key: "streak_30", value: 30, name: "One Month Strong", emoji: "🏆", description: "A full month of consistency!" },
  { key: "streak_66", value: 66, name: "Habit Formed", emoji: "🧠", description: "Scientifically proven habit formation!" },
  { key: "streak_100", value: 100, name: "Century Club", emoji: "💎", description: "100 days of excellence!" },
  { key: "streak_365", value: 365, name: "Legend", emoji: "👑", description: "A full year! You're legendary!" },
];

export const COMPLETION_MILESTONES = [
  { key: "total_10", value: 10, name: "Getting Started", emoji: "🌟", description: "First 10 completions!" },
  { key: "total_50", value: 50, name: "Consistent", emoji: "🚀", description: "50 completions and counting!" },
  { key: "total_100", value: 100, name: "Centurion", emoji: "💯", description: "100 completions achieved!" },
  { key: "total_500", value: 500, name: "Power User", emoji: "⚡", description: "500 completions! Unstoppable!" },
  { key: "total_1000", value: 1000, name: "Master", emoji: "🏅", description: "1000 completions! True mastery!" },
];

export const CONSISTENCY_MILESTONES = [
  { key: "perfect_week", name: "Perfect Week", emoji: "✨", description: "All habits completed for 7 days!" },
  { key: "perfect_month", name: "Perfect Month", emoji: "🌙", description: "All habits completed for 30 days!" },
  { key: "comeback", name: "Comeback Champion", emoji: "💪", description: "Back after a break with 7 days strong!" },
];

export const GLOBAL_MILESTONES = [
  { key: "habit_creator", name: "Habit Creator", emoji: "🎊", description: "Created your first habit!" },
  { key: "multi_tracker", name: "Multi-Tracker", emoji: "📊", description: "Tracking 5+ habits!" },
  { key: "perfectionist", name: "Perfectionist", emoji: "🎯", description: "100% completion for 30 days!" },
  { key: "transformer", name: "Transformer", emoji: "🔄", description: "1000 total habit completions!" },
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
