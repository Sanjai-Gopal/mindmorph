# MindMorph

AI-powered adaptive learning platform for college students tackling complex topics.

## Monorepo

- `apps/web`: Next.js 14 App Router frontend
- `apps/server`: Express + Socket.IO backend
- `packages/shared`: Shared constants and types

## Quick Start

1. Install dependencies:
   - `npm install`
2. Start local infra:
   - `docker compose up -d`
3. Run apps:
   - `npm run dev`

## Environment

Create `apps/web/.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
