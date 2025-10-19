# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install dependencies
  - npm install
- Run dev server (Turbopack)
  - npm run dev
  - Visit http://localhost:3000
- Build and run
  - npm run build
  - npm run start
- Lint
  - npm run lint .
  - Auto-fix: npm run lint -- --fix .
- Prisma (PostgreSQL)
  - Generate client (outputs to src/generated/prisma): npx prisma generate
  - Apply migrations locally: npx prisma migrate dev --name <name>
  - Open Prisma Studio: npx prisma studio

Environment variables required to run:
- DATABASE_URL (PostgreSQL connection string)
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (for Google OAuth in better-auth)

Tests
- No test setup detected in this repo.

## Architecture overview

Stack
- Next.js App Router (src/app), TypeScript, Turbopack, ESLint (flat config), Tailwind CSS v4
- Auth via better-auth with Prisma adapter and Next.js route handler
- Database via Prisma; generated client in src/generated/prisma (see prisma/schema.prisma)

Auth flow
- Server config: src/lib/auth.ts
  - better-auth with prismaAdapter(prisma) and plugins [username(), nextCookies()].
  - Google provider mapped to a unique username; requires GOOGLE_CLIENT_*
- API handler: src/app/api/auth/[...all]/route.ts exposes GET/POST via toNextJsHandler(auth.handler)
- Client hooks: src/lib/auth-client.ts exposes authClient and useSession()
- Server actions: src/actions/auth.ts
  - signUp/signIn use zod schemas (src/schemas/*) and auth.api methods; signOut uses auth.api.signOut; usernameCheck queries Prisma
- Session guard: src/data/user.dal.ts requireUser() fetches session via auth.api.getSession({ headers }) and redirects if unauthenticated

UI and routing
- Root layout: src/app/layout.tsx loads fonts and Toaster; app uses server components by default
- Example protected page: src/app/page.tsx fetches user via requireUser() and renders LogoutButton
- Auth pages: src/app/sign-in/page.tsx, src/app/sign-up/page.tsx (user flows call server actions)
- UI components: src/components/ui/* (shadcn-style variants) and app-level components (Navbar, SessionMonitor, LogoutButton)

Configuration
- TypeScript: tsconfig.json with path alias "@/*" -> "src/*"
- ESLint: eslint.config.mjs extends next/core-web-vitals and next/typescript; ignores generated code and build outputs
- Next.js: next.config.ts minimal defaults

Database schema
- prisma/schema.prisma defines User/Session/Account/Verification models; unique constraints on email/username/displayUsername
- Migrations stored under prisma/migrations; run npx prisma migrate dev to evolve schema
