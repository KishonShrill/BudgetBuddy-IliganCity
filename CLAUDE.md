# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Budget Buddy** is a grocery price tracking web app for Iligan City. It helps users compare prices across local stores and manage their shopping budgets. The project is a **monorepo** with two coexisting projects:

1. **Legacy Vite app** (`src/` + `server/`) — the original React 18 + Express.js app, being migrated to Next.js
2. **Next.js migration** (`budget-buddy-next/`) — the new Next.js 16 App Router app (static export, deployed to Vercel)

## Architecture

### Legacy Stack (Vite + Express)
- **Frontend**: Vite, React 18, React Router v6, React Query v3, Redux Toolkit, Tailwind CSS
- **Backend**: Express.js, MongoDB (Mongoose), JWT auth, Google OAuth, Swagger docs
- **Routes**: `server.mjs` → `/auth`, `/api/v1/products`, `/api/v1/locations`, `/api/v1/categories`, `/api/v1/listings`, `/api/v1/users`, `/api/v1/contributions`, `/api/reports`
- **Models**: User, Product, Location, Listing, PendingListing, Category, PriceLog (`server/models/models.js`)
- **Role hierarchy**: `regular(1) → budget_starter(2) → wise_spender(3) → budget_guru(4) → moderator(5) → admin(10)`
- **Auth helpers**: `server/helpers/auth.js` (JWT verification, role gating, account age gating), `server/helpers/gamification.js`

### Next.js Migration Stack
- **Frontend**: Next.js 16 (App Router, static export), React 19, TanStack Query v5, Redux Toolkit, Tailwind CSS v4
- **Key routes** (`budget-buddy-next/app/`):
  - `/` → `page.tsx` (homepage: Hero, Features, About, HowItWorks, Footer)
  - `/locations` → `locations/page.tsx` (server component + `LocationsClient` client component)
  - `/locations/[location]` → dynamic route with `GroceryClient.tsx` (product listings per store)
  - `/authenticate` → login page
  - `/budget-hub` → budget hub
  - `/receipt` → receipt/cart page
  - `/settings` → settings page
  - `/privacy-policy`, `/terms-of-service` → static pages
- **State**: Redux Toolkit (`cartSlice.ts`) + TanStack Query for server data
- **Auth**: Google OAuth via `@react-oauth/google`
- **Key hooks**: `useFetchLocations`, `useFetchListings`, `useFetchListingsByLocation`, `useSettings`
- **Key components**: `Header`, `Footer`, `Cart`, `ProductCard`, `LocationCard`, `Searchbar`, `MainBottomNav`, `ToastProvider`
- **UI primitives**: shadcn/ui components in `components/ui/` (button, card, dialog, input, select, badge)
- **Providers**: `Providers.tsx` wraps ThemeProvider → GoogleOAuthProvider → QueryClientProvider → StoreProvider

### Server (Express)
- Entry: `server/server.mjs` — Express app with Mongoose, CORS, rate limiting, Swagger
- Routes: `server/routes/` (authRoutes, productRoutes, locationRoutes, categoryRoutes, listingRoutes, userRoutes, contributionRoutes, reportRoutes)
- Helpers: `server/helpers/auth.js`, `server/helpers/gamification.js`, `server/helpers/upload.js`, `server/helpers/generateProductId.js`, `server/helpers/getPaginationParams.js`
- Models: `server/models/models.js` — all Mongoose schemas
- Config: `server/vercel.json` for Vercel Node.js deployment

## Key Commands

### Legacy App (Vite + Express)
```bash
# Start both frontend and backend in dev mode
npm run start

# Start backend only with nodemon
npm run server:dev

# Build frontend
npm run build

# Lint
npm run lint

# Run tests (Vitest — env validation only)
npm run test

# Generate sitemap
npm run generate:sitemap
```

### Next.js App (`budget-buddy-next/`)
```bash
# Dev server on port 5173
npm run dev

# Build (static export to `out/`)
npm run build

# Start production preview
npm run start

# Lint
npm run lint
```

### Server Only
```bash
# Start Express server
npm run server

# Generate Swagger spec
npm run generate:swagger
```

## Environment Variables

Key env vars (see `.env` and `.env.local`):
- `HIDDEN_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing key
- `VITE_CLIENT_ID` — Google OAuth client ID
- `VITE_DEVELOPMENT` — `"true"` for dev mode (allows localhost CORS)
- `VITE_LOCALHOST` — Localhost IP for dev API calls
- `VITE_API_VERSION` — API version prefix (e.g., `v1`)
- `RECAPTCHA_SECRETKEY` — Google reCAPTCHA secret
- `DISCORD_WEBHOOK_URL` — Discord webhook for reports
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary config

## Migration Status

The Next.js app (`budget-buddy-next/`) is actively replacing the legacy Vite app. The old `src/` and `server/` directories still contain the working legacy code. The Next.js app currently implements the public-facing pages (homepage, locations, grocery listings, cart, receipt, settings, auth) while the admin/contribution console and some backend routes remain in the legacy stack.

## Testing

Tests are minimal — `env.test.js` validates environment variables and MongoDB connectivity using Vitest. Run with `npm run test` from the root.

## Linting

- Root: ESLint 9 (flat config) for the legacy Vite app (`eslint.config.mjs`)
- Next.js: ESLint 9 with `eslint-config-next` (`budget-buddy-next/eslint.config.mjs`)
