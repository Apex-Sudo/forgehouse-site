# Retention Hooks Setup

## 1. Run the database migration

Go to Supabase Dashboard > SQL Editor and run:
```
src/db/migrations/001_retention_hooks.sql
```

This creates: `users`, `conversations`, `free_tier_conversations`, `saved_insights` tables with RLS policies.

## 2. Set up LinkedIn OAuth

1. Go to https://www.linkedin.com/developers/apps
2. Create app, request "Sign In with LinkedIn using OpenID Connect"
3. Authorized redirect URI: `https://forgehouse.io/api/auth/callback/linkedin` (and `http://localhost:3000/api/auth/callback/linkedin` for dev)
4. Copy Client ID and Secret to `.env.local`

### NextAuth Secret
```bash
openssl rand -base64 32
```
Add to `.env.local` as `NEXTAUTH_SECRET`

## 3. Uncomment env vars

In `.env.local`, uncomment and fill in the auth variables.

## 4. What was built

- **Auth**: NextAuth v5 with LinkedIn only. Session includes Supabase user ID. Every sign-in captures job title, company, industry.
- **Conversation persistence**: Subscribers get permanent storage in `conversations`. Free tier users get 7-day expiring storage in `free_tier_conversations`. Anonymous users get no persistence (unchanged behavior).
- **Context injection**: Both chat routes pull last 30 messages from most recent conversation and inject as system prompt context. Pass `conversation_id` in the request body to save messages.
- **Saved insights**: POST/GET/DELETE at `/api/insights`. Requires active subscription.
- **Middleware**: Auth middleware on `/api/conversations` and `/api/insights` routes.

## 5. Frontend integration notes

- Import `signIn`, `signOut` from `next-auth/react` for UI
- Wrap app in `<SessionProvider>` for client-side session access
- Pass `conversation_id` in chat request body to enable persistence
- Call `POST /api/conversations` with `{ mentor_slug }` to create a new conversation before chatting
