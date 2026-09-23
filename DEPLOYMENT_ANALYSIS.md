# ARO Production Deployment Analysis

## CHECK 1 - Frontend Next.js Routing
**Location:** `next.config.ts` lines 7-42

All API routes are rewritten via Next.js config:
- `/api/access/:path*` → `${BACKEND_URL}/api/access/:path*`
- `/api/coding/:path*` → `${BACKEND_URL}/api/coding/:path*`
- And 6 other routes...

**Result:** Frontend requests go to **SEPARATE Express backend** (Backend option B), NOT Vercel serverless functions. The `BACKEND_URL` env var is required.

Default: `http://localhost:5000`
Production: Must be set to deployed backend URL

## CHECK 2 - Express Backend Deployment Status
**Current state:** Backend is a separate Node.js Express application in `/backend` directory.

**Evidence:**
- No vercel.json configuration exists
- Backend has separate package.json with Express dependencies
- README explicitly states: "The coding editor also needs the Express API in `backend/` (npm run dev there, port 5000)"
- No serverless functions configuration

**Conclusion:** Express backend is **NOT deployed on Vercel**. It's a separate service that must be deployed independently.

## CHECK 3 - Environment Variables Required

### Frontend (Vercel - Next.js):
- `BACKEND_URL` - REQUIRED - URL of deployed Express backend
- `NEXT_PUBLIC_SUPABASE_URL` - REQUIRED - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - REQUIRED - Supabase anon key
- `NEXT_PUBLIC_API_URL` - REQUIRED

### Backend (Separate server):
- `CLIENT_URL` - REQUIRED - Frontend URL (e.g., https://aro.vercel.app)
- `SUPABASE_URL` - REQUIRED - Supabase project URL
- `SUPABASE_ANON_KEY` - REQUIRED - Supabase anon key
- `ONLINECOMPILER_API_KEY` - REQUIRED - OnlineCompiler API key (server-side only)
- `BILLING_ADMIN_SECRET` - REQUIRED

**Security:** `ONLINECOMPILER_API_KEY` must NEVER be prefixed with `NEXT_PUBLIC_`. It remains server-side in backend environment.

## CHECK 4 - Vercel Configuration

**Issue:** Vercel will only deploy the Next.js frontend from `/`. The Express backend in `/backend` will NOT be deployed.

**Current rewrites:** Will fail in production unless:
1. Backend is deployed separately
2. BACKEND_URL Vercel environment variable is set to backend URL
3. All backend environment variables are configured on backend server

**No vercel.json exists** - No Vercel-specific routing configuration.

## CHECK 5 - OnlineCompiler Production Flow

**Expected production flow:**
```
Browser → Vercel Next.js → Rewrite → BACKEND_URL → Express server → onlineCompilerService.js → OnlineCompiler API → Result → Browser
```

**API Key location:** Server-side only in Express backend environment variables. NEVER in frontend code.

## CHECK 6 - Deployment Readiness

**Is production architecture ready for Run?** NO

**Why:**
1. Express backend is not part of Vercel deployment
2. BACKEND_URL environment variable must be configured in Vercel
3. Backend server must be deployed separately with ONLINECOMPILER_API_KEY
4. No current Vercel deployment configuration for the backend

**Minimum required changes:**
1. Deploy Express backend to separate hosting (Railway, Render, Fly.io, etc.)
2. Set BACKEND_URL in Vercel environment variables to backend URL
3. Set all required environment variables in backend hosting
4. Ensure ONLINECOMPILER_API_KEY is set in backend environment (NOT in Vercel)
5. Update CLIENT_URL to production frontend URL

**DO NOT:**
- Push backend/.env file (it's gitignored)
- Add ONLINECOMPILER_API_KEY to NEXT_PUBLIC_ variables
- Remove Judge0 files (still referenced by other services)
- Modify authentication/architecture

## Summary

1. **Is production ready?** NO - Backend must be deployed separately
2. **Is backend deployed?** NO - Only frontend would deploy to Vercel
3. **Where will /api/coding/run execute?** On separate Express server, not Vercel
4. **Vercel env vars needed:** BACKEND_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
5. **Is API key safe?** YES - If backend is separate and key stays server-side
6. **Is rewrite production-safe?** NO - Requires BACKEND_URL to be configured
7. **Issue preventing Run:** Backend not deployed, BACKEND_URL not set
8. **Minimum changes:** Deploy backend separately, set BACKEND_URL, configure env vars