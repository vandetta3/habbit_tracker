# Daily Stack

A production-ready habit tracking web application built with Next.js, InstantDB, and TailwindCSS.

## Features

- ✅ **Habit Tracking**: Create and manage daily, weekly, or custom frequency habits
- 🔥 **Streak Tracking**: Monitor current and longest streaks for each habit
- 🏆 **Achievements**: Earn milestones for consistency and dedication
- 📊 **Scorecard**: Visualize your progress with charts and statistics
- ✅ **Todos**: Manage tasks with priorities and due dates
- 📝 **Notes**: Create markdown notes with autosave
- 💬 **Daily Quotes**: Get motivated with a new quote every day
- 🔐 **Authentication**: Secure email-based magic link login

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: InstantDB (real-time database with built-in auth)
- **Styling**: TailwindCSS + shadcn/ui components
- **Validation**: Zod
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An InstantDB account (free at [instantdb.com](https://instantdb.com))

### Installation

1. **Clone or navigate to the repository**

```bash
cd Daily-Stack
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up InstantDB**

- Go to [instantdb.com](https://instantdb.com) and sign up/login
- Create a new app
- Copy your App ID

4. **Configure environment variables**

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id_here
```

5. **Push the database schema**

```bash
npx instant-cli login
npx instant-cli push
```

6. **Run the development server**

```bash
npm run dev
```

7. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. Open the app and you'll be redirected to the login page
2. Enter your email address
3. Check your email for the 6-digit magic code
4. Enter the code to sign in
5. Start creating your first habit!

### Creating a Habit

1. Navigate to "Habits" from the sidebar
2. Click "New Habit"
3. Fill in the habit details:
   - Title (required)
   - Description (optional)
   - Choose an icon
   - Select a color
   - Set frequency (daily, weekly, or custom days)
   - Set start date
4. Click "Create Habit"

### Completing a Habit

1. Go to your Dashboard or Habits page
2. Click the checkbox next to a habit to mark it complete for today
3. Watch your streak grow!

### Earning Achievements

Achievements are automatically earned when you hit milestones:
- **Streak Milestones**: 1, 3, 7, 21, 30, 66, 100, 365 days
- **Completion Milestones**: 10, 50, 100, 500, 1000 total completions
- **Consistency Milestones**: Perfect weeks and months
- **Global Milestones**: Multi-habit tracking, high completion rates

## Project Structure

```
daily-stack/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (protected)/       # Protected app pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── habits/           # Habit-specific components
│   └── ...
├── lib/                   # Utility functions
│   ├── instant.ts        # InstantDB client
│   ├── habits.ts         # Habit logic
│   ├── milestones.ts     # Achievement logic
│   └── ...
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── instant.schema.ts      # Database schema
```

## Database Schema

The app uses InstantDB with the following entities:

- **habits**: Track habit information
- **habitCompletions**: Log of completed habits by date
- **milestones**: Earned achievements
- **todos**: Task management
- **notes**: User notes
- **dailyQuotes**: Cached daily motivational quotes

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variable: `NEXT_PUBLIC_INSTANT_APP_ID`
5. Deploy!

### Deploy to Other Platforms

1. Build the production bundle:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_INSTANT_APP_ID` | Your InstantDB App ID | Yes |

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build Locally

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Features in Detail

### Habit Tracking

- Create habits with custom icons and colors
- Set frequency: daily, weekly, or specific days
- Track completion status for each day
- View current and longest streaks
- Calculate completion rates (7-day and 30-day)

### Milestone System

Progressive achievement system based on research:
- Early milestones (1, 3, 7 days) for quick wins
- Medium milestones (21, 30 days) for building consistency
- Long-term milestones (66, 100, 365 days) for mastery
- Celebration modals with confetti animations

### Scorecard

- Daily completion score (percentage of habits completed)
- Weekly progress chart
- Top 3 habit streaks
- Trend analysis

### Quote System

- Fetches daily quotes from ZenQuotes API
- Falls back to 50+ curated static quotes
- Cached per user per day for consistency

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

## Acknowledgments

- [InstantDB](https://instantdb.com) for the amazing database
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Lucide](https://lucide.dev) for icons
- [ZenQuotes](https://zenquotes.io) for motivational quotes

---

Built with ❤️ for building better habits
