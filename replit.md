# Trusty - Live Competition Platform

## Overview
Trusty is a React + TypeScript frontend app — India's Most Trusted Live Competition Platform. It uses Firebase for authentication, database (Firestore), and storage. No backend server is needed.

## Architecture
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Auth & Database**: Firebase (Firestore, Google Auth, Storage)
- **Routing**: React Router v6
- **State**: TanStack React Query

## Key Pages
- `/login` — Google sign-in
- `/` — Home/Index (protected)
- `/battle/live` — Live Battle (protected)
- `/profile` — User profile (protected)
- `/pvp` — PvP mode (protected)
- `/leaderboard` — Leaderboard (protected)
- `/redeem` — Redeem rewards (protected)
- `/admin` — Admin dashboard (admin-only)

## Firebase Config
Firebase credentials are hardcoded in `src/lib/firebase.ts` (public-facing web API keys, standard for Firebase client SDKs).

## Agora Video Calling
- Package: `agora-rtc-react`
- App ID: `01eefeb03e6a4ff1b6131ca9e3d057a8`
- Channel: `trusty-battle`
- Mode: Testing (no token required, `token: null`)
- Component: `src/components/VideoArena.tsx`
- 2x2 grid layout: local user + up to 3 remote users
- Empty slots show "Waiting for Player..." cards
- Controls: Mute Audio, Stop Video, Leave Battle

## Running the App
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build`

## Replit Adaptations
- Removed `lovable-tagger` from Vite config (Lovable-specific plugin)
- Set Vite server host to `0.0.0.0` and port to `5000` for Replit compatibility
- Workflow: "Start application" runs `npm run dev` on port 5000
