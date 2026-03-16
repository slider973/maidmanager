# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - TypeScript check + production build
- `npm run preview` - Preview production build

## Tech Stack

- **Framework**: SolidJS with TypeScript
- **Build**: Vite
- **Backend**: Supabase (auth + database)
- **Routing**: @solidjs/router

## Architecture

```
src/
├── lib/
│   ├── supabase.ts      # Supabase client (uses VITE_SUPABASE_* env vars)
│   └── auth.tsx         # AuthProvider context + useAuth hook
├── components/
│   └── ProtectedRoute.tsx  # Redirects to /login if not authenticated
├── pages/
│   ├── Login.tsx        # Login/signup form
│   └── Home.tsx         # Protected home page
└── App.tsx              # Router setup with AuthProvider wrapper
```

## Auth Flow

- `AuthProvider` wraps the entire app and manages auth state via Supabase
- `useAuth()` provides: `user()`, `session()`, `loading()`, `signIn()`, `signUp()`, `signOut()`
- Protected routes use `<ProtectedRoute>` component which redirects unauthenticated users

## Environment Variables

Required in `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase Admin Access

Pour les opérations admin sur la base de données (self-hosted à db.wefamily.ch):

```bash
# Query via REST API
curl -s "https://db.wefamily.ch/rest/v1/TABLE_NAME" \
  -H "apikey: $(cat .env.supabase | grep SERVICE_ROLE_KEY | cut -d= -f2)" \
  -H "Authorization: Bearer $(cat .env.supabase | grep SERVICE_ROLE_KEY | cut -d= -f2)"

# Ou utiliser le script helper
./scripts/supabase-query.sh profiles
./scripts/supabase-query.sh staff_members "email=eq.test@example.com"
```

Credentials dans `.env.supabase` (non commité).

## Active Technologies
- TypeScript 5.9 with ES2022 targe + SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95 (001-complete-auth)
- Supabase (PostgreSQL with built-in auth tables) (001-complete-auth)
- TypeScript 5.9+ avec mode stric + SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95 (002-add-staff)
- Supabase PostgreSQL avec RLS (002-add-staff)
- TypeScript 5.9, SolidJS 1.9 + @solidjs/router 0.15, @supabase/supabase-js 2.95, solid-js 1.9 (004-planning-crud)
- Supabase PostgreSQL (table `schedule_entries`) (004-planning-crud)
- TypeScript 5.9 (strict mode) + SolidJS 1.9, @solidjs/router, @supabase/supabase-js 2.95 (005-assign-task)
- Supabase PostgreSQL (self-hosted at wefamily.ch) (005-assign-task)
- TypeScript 5.9 with strict mode enabled + SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95 (006-view-statistics)
- Supabase PostgreSQL (existing tables: staff_members, schedule_entries, tasks) - No new tables (006-view-statistics)
- TypeScript 5.9, SolidJS 1.9 + SolidJS, @solidjs/router, @supabase/supabase-js 2.95 (007-billing)
- Supabase PostgreSQL with RLS (007-billing)
- TypeScript 5.9 with strict mode + SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95 (010-client-schedule-calendar)
- Supabase PostgreSQL (table `schedule_entries` existante) (010-client-schedule-calendar)

## Recent Changes
- 001-complete-auth: Added TypeScript 5.9 with ES2022 targe + SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95
