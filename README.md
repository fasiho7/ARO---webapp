# Aro

Web platform for students and beginner developers, initially targeting Pakistan and South Asia.

Core product:

- AI Tutor
- Career Roadmaps
- Coding Platform
- Progress Tracking + Awards

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in Supabase values in `.env.local` (see below), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The coding editor also needs the Express API in `backend/` (`npm run dev` there, port 5000).

Put secrets only in `.env.local`. Never commit API keys or the Supabase service role key.

## Authentication (Step 3)

Aro uses **Supabase Auth**. Passwords are never stored in application tables.

1. Create a project at [https://supabase.com](https://supabase.com).
2. Open **Project Settings → API**.
3. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the **anon / public** key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. In the Supabase SQL editor, run:
   - `supabase/migrations/20260815_profiles_and_progress.sql`
   - `supabase/migrations/20260816_profile_update_grants.sql`
6. Under **Authentication → URL configuration**, set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

Restart `npm run dev` after changing env files.

Without those public keys, the marketing site and local Coding/Roadmaps still load, but sign-in is disabled.

## Scripts

```bash
npm run dev        # local development
npm run lint       # ESLint
npm run typecheck  # TypeScript (`strict`)
npm run build      # production build
```
