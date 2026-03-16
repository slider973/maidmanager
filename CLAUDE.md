# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (root)
- `npm run dev` - Start frontend dev server (http://localhost:5173)
- `npm run build` - TypeScript check + production build
- `npm run preview` - Preview production build

### Backend (backend/)
- `php artisan serve` - Start Laravel API server (http://localhost:8000)
- `php artisan migrate` - Run database migrations
- `php artisan route:list --path=api` - List API routes

## Tech Stack

- **Frontend**: SolidJS with TypeScript, Vite, @solidjs/router
- **Backend**: Laravel 12 with Sanctum (API token auth)
- **Database**: SQLite (dev), Laravel Eloquent ORM

## Architecture

```
├── src/                    # SolidJS Frontend
│   ├── lib/
│   │   ├── api.ts          # API client (fetch with Bearer token)
│   │   └── auth.tsx        # AuthProvider context + useAuth hook
│   ├── services/
│   │   └── auth.service.ts # Auth operations (login, register, etc.)
│   ├── components/
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   └── App.tsx
│
├── backend/                # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/AuthController.php
│   │   └── Models/ (User, Profile)
│   ├── routes/api.php      # API routes
│   └── database/migrations/
```

## API Routes

- `POST /api/register` - Create account
- `POST /api/login` - Login (returns token)
- `POST /api/logout` - Logout (auth required)
- `GET /api/user` - Get current user (auth required)
- `PUT /api/user/password` - Update password (auth required)
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

## Auth Flow

- Frontend stores Sanctum token in `localStorage`
- `AuthProvider` checks `/api/user` on mount to restore session
- `useAuth()` provides: `user()`, `loading()`, `signIn()`, `signUp()`, `signOut()`
- Protected routes use `<ProtectedRoute>` which redirects unauthenticated users

## Environment Variables

Frontend `.env.local`:
- `VITE_API_URL` - Laravel API URL (default: http://localhost:8000/api)

Backend `backend/.env`:
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Active Technologies
- TypeScript 5.9 + SolidJS 1.9, @solidjs/router 0.15
- Laravel 12, Sanctum 4, SQLite
