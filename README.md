# Tiny Habit Coach

An AI-powered habit coach based on the frameworks from *Atomic Habits* by James Clear. You track one habit at a time. The AI helps you design it, checks in when you miss a day, and reviews your progress weekly.

## What it does

- **Onboarding**: a conversation that builds your "implementation intention": I will [habit] at [time] in [location], plus a two-minute version and your why.
- **Daily check-in**: mark each day as done or not. If you miss, you can note why.
- **Missed day coaching**: the AI diagnoses the miss and decides whether to encourage you or redesign the habit.
- **Weekly review**: the AI looks at your completion rate and streak and gives specific (not generic) feedback.

## Stack

- **Frontend**: React, deployed on Vercel
- **Backend**: Python / Flask, deployed on Railway
- **Database**: PostgreSQL via Supabase
- **AI**: Claude (Anthropic API) via a backend proxy

## Project structure

```
tiny-backend/
  app/
    routes/       # users, habits, checkins, stats, ai
    prompts/      # onboarding, missed_day, weekly, shared_context
    db/           # schema.py (init), queries.py
  wsgi.py
  Procfile
tiny-frontend/
```

## Setup

### Backend

```bash
cd tiny-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `tiny-backend/`:
```
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=your_supabase_connection_string
```

```bash
flask --app wsgi:app run
```

### Frontend

```bash
cd tiny-frontend
npm install
npm run dev
```

Create a `.env.local` file in `tiny-frontend/`:
```
VITE_API_URL=http://localhost:5000
```

## Deployment

- **Frontend**: Vercel — set `VITE_API_URL` to your Railway backend URL
- **Backend**: Railway — set `ANTHROPIC_API_KEY` and `DATABASE_URL` as environment variables
- **Database**: Supabase — use the Session Pooler connection string (IPv4 compatible)

## Key design decisions

- One habit per user, as most habit apps fail because they let you add too much at once.
- The AI never mentions willpower or motivation, only environment and schedule changes.
- Habit redesigns are tracked in a `redesigns` table so you can see how the habit evolved over time.
