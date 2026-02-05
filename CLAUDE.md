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
