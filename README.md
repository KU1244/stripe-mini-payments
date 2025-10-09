# Stripe Mini Payments

Minimal Next.js + Stripe Checkout sample with secure server patterns.

## Tech Stack
- Next.js (Pages Router)
- Prisma + PostgreSQL (Supabase)
- Stripe Checkout (one-time payment)
- TypeScript / Tailwind CSS
- Security layers: CSRF, Origin allowlist, Rate limit, Zod validation

## Why this repo?
Keep a tiny, production-lean example to re-use in client work and demos.
- Fast local setup
- Clearly separated TEST vs LIVE
- Opinionated security defaults

## Features
- ✅ Minimal `/api/stripe/ping` to verify Stripe key
- ✅ `/api/stripe/checkout` (fixed price, server-owned)
- ✅ Security middleware-like helpers (CSRF, origin, rate limit, zod)
- ✅ `.env.example` for safe onboarding

## Project Status
- Week 4 of the learning roadmap: “Checkout & Security”
- Next: add webhook handling and success/cancel pages

