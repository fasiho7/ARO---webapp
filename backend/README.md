# Aro Backend

API server for Aro, a learning platform for students and beginner developers.

This folder is the **backend foundation only**. Product features are not implemented yet.

## Technology stack

- Node.js
- Express.js
- JavaScript
- Supabase PostgreSQL (`@supabase/supabase-js`)
- dotenv
- cors
- cookie-parser
- nodemon (development)

## Folder structure

```
backend/
├── src/
│   ├── config/          # Supabase client
│   ├── controllers/     # Reserved for later phases
│   ├── routes/          # HTTP routes
│   ├── middleware/      # 404 and error handlers
│   ├── services/        # Reserved for later phases
│   ├── utils/           # Environment validation
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Installation

From the `backend` folder:

```bash
npm install
```

## Configure Supabase

1. Create a project at [https://supabase.com](https://supabase.com).
2. Open **Project Settings → API**.
3. Copy the **Project URL** into `SUPABASE_URL`.
4. Copy the **anon / public** key into `SUPABASE_ANON_KEY`.
5. Leave `SUPABASE_SERVICE_ROLE_KEY` empty for this phase. Do not put it in frontend code.

No application tables are required for this foundation. The Supabase health check uses Auth session lookup, not a custom table.

## Environment variables

Copy `.env.example` to `.env` and fill in real values:

| Variable | Required now | Purpose |
|---|---|---|
| `PORT` | Yes | HTTP port (default `5000`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `CLIENT_URL` | Yes | Frontend origin for CORS. Aro frontend is Next.js at `http://localhost:3000` |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe for server client with RLS later) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Placeholder only. Do not use in this phase |

Never commit `.env`. Never hardcode keys in source files.

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

Set `NODE_ENV=production` in the environment.

## Health-check endpoints

```
GET http://localhost:5000/api/health
GET http://localhost:5000/api/health/supabase
```

`GET /api/health` confirms the Express server is up.

`GET /api/health/supabase` confirms the backend can reach Supabase. It does not create tables and does not use the service-role key.

## What is implemented

- Express app
- CORS locked to `CLIENT_URL` with credentials
- Supabase JS client (anon key)
- Health checks
- 404 handler
- Central JSON error handler

## What is intentionally not implemented

Authentication, AI Tutor, coding execution, roadmaps, progress, awards, and payments will be implemented in later phases.

Do not connect OpenAI, Anthropic, Gemini, Judge0, Stripe, or other providers in this foundation.

## Future planned modules

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication (Phase 2) |
| `/api/users` | User profiles |
| `/api/ai` | AI Tutor |
| `/api/roadmaps` | Career roadmaps |
| `/api/coding` | Coding practice |
| `/api/progress` | Progress tracking |
| `/api/awards` | Awards / achievements |
| `/api/subscriptions` | Subscriptions / payments |
