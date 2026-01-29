# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- An InstantDB account (free at [instantdb.com](https://instantdb.com))

## Setup Steps

### 1. Install Dependencies (Already Done ✅)

The dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Get Your InstantDB App ID

1. Go to [https://instantdb.com](https://instantdb.com)
2. Sign up or log in
3. Click "Create a new app"
4. Give your app a name (e.g., "Daily Stack")
5. Copy your **App ID** (it looks like: `abc123-def456-ghi789`)

### 3. Update Environment Variables

Edit the `.env.local` file and replace `your_instant_app_id_here` with your actual App ID:

```env
NEXT_PUBLIC_INSTANT_APP_ID=abc123-def456-ghi789
```

### 4. Push Database Schema to InstantDB

Run these commands in order:

```bash
# Login to InstantDB
npx instant-cli login

# Push the schema to your app
npx instant-cli push
```

When prompted, select your app from the list.

### 5. Start the Development Server

If the server is not already running:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 6. Test the App

1. **Login**: 
   - Go to http://localhost:3000
   - Enter your email address
   - Check your email for the 6-digit code
   - Enter the code to sign in

2. **Create Your First Habit**:
   - Click "New Habit" on the Habits page
   - Fill in the details (title, icon, color, frequency)
   - Click "Create Habit"

3. **Complete a Habit**:
   - Go to Dashboard or Habits page
   - Click the circle icon next to a habit to mark it complete
   - Watch your streak grow! 🔥

4. **Explore Features**:
   - **Dashboard**: See today's score and overview
   - **Habits**: Manage all your habits
   - **Scorecard**: View weekly progress charts
   - **Achievements**: Track your milestones

## Troubleshooting

### "Failed to connect to InstantDB"

- Make sure your `NEXT_PUBLIC_INSTANT_APP_ID` is correct in `.env.local`
- Restart the dev server after changing environment variables
- Check that you pushed the schema with `npx instant-cli push`

### "Magic code not received"

- Check your spam/junk folder
- Make sure you entered your email correctly
- Try again with a different email address
- Check InstantDB dashboard to ensure email is configured

### Build errors

If you get PostCSS or Tailwind errors:

```bash
npm install @tailwindcss/postcss --save-dev
```

Then restart the dev server.

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub (if not already done)
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variable:
   - Name: `NEXT_PUBLIC_INSTANT_APP_ID`
   - Value: Your InstantDB App ID
6. Click "Deploy"

Your app will be live in minutes!

## What's Next?

- Create multiple habits with different frequencies
- Complete habits daily to build streaks
- Earn achievements by hitting milestones
- Track your progress on the scorecard
- Stay motivated with daily quotes

Enjoy building better habits! 🎯
