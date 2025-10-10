
# Stripe Mini Payments

A minimal, production-lean example of **Next.js + Stripe Checkout + Webhooks**.
Designed to demonstrate a realistic, secure payment flow suitable for learning, client projects, or small-scale production use.

---

## Tech Stack

* **Next.js (Pages Router)** – Simple API routes written in TypeScript
* **Prisma + PostgreSQL (Supabase)** – Lightweight database for payments and event logs
* **Stripe Checkout** – One-time payment with server-defined pricing
* **Stripe Webhooks** – Verified, idempotent event handling for completed checkouts
* **Tailwind CSS** – Clean and minimal UI
* **Security Layers**

  * CSRF token (double-submit pattern)
  * Origin allowlist
  * Rate limiting (Upstash Redis + in-memory fallback)
  * Zod schema validation
  * Event replay protection (`event.id` stored with `@unique`)

---

## Overview

This repository shows how to integrate Stripe Checkout securely in a modern web app.
It focuses on **clarity, safety, and maintainability**, following real production patterns:

* Clear separation between **TEST** and **LIVE** environments
* Secure webhook verification and database synchronization
* Defensive defaults for validation, rate limiting, and error handling
* Easy to extend into subscriptions, billing portals, or analytics dashboards

---

## Completed Features

| Feature                   | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `/api/stripe/ping`        | Verifies Stripe connection and account key                |
| `/api/stripe/checkout`    | One-time payment with a fixed server-side price           |
| `/api/stripe/webhook`     | Verifies Stripe signature and updates the database        |
| Success Page (`/success`) | Displays confirmation after payment completion            |
| Event Replay Protection   | Prevents duplicate processing via unique `event.id`       |
| Payment Record Update     | Marks payments as `paid` after webhook confirmation       |
| Event Log                 | Saves all Stripe events for audit and debugging           |
| CSRF Protection           | Implements a double-submit cookie strategy                |
| Rate Limiting             | 5 requests per minute per IP address                      |
| Origin Allowlist          | Rejects untrusted origins                                 |
| Zod Validation            | Enforces strict request structure                         |
| Structured Logging        | Includes `request_id`, `clientRef`, and `idempotency_key` |
| Tailwind UI               | Minimal checkout button and success page                  |

---

## Recent Additions

### Stripe Webhook Integration

* Implemented signature verification using `stripe.webhooks.constructEvent()`
* Uses raw request body (`raw-body`) to prevent encoding issues
* Stores `event.id` as unique to avoid replay or double-processing
* Idempotent database updates via `Prisma upsert()`

### Success Page

* Redirected from Stripe Checkout upon successful payment
* Simple confirmation UI with a link back to the home page
* Final payment confirmation handled by the server-side webhook

### Database Synchronization

* `Payment` table automatically updated to reflect `paid` or `failed` state
* `EventLog` table records all webhook events for transparency and debugging

---

## Demonstration Flow

**1. User initiates Checkout** → Stripe payment page
**2. Payment succeeds** → User redirected to `/success`
**3. Stripe sends webhook** → Server verifies signature and records event
**4. Database updates automatically** → `Payment` status becomes `paid`

This demonstrates a full payment loop from frontend to backend with complete data integrity.

---

## Screenshots

| Step                  | Description                                               |
| --------------------- | --------------------------------------------------------- |
| Checkout Success Page | Shown after Stripe payment completes                      |
| Webhook Log (CLI)     | Server receives and verifies `checkout.session.completed` |
| Prisma Studio         | Database shows `Payment` record updated to `paid`         |

---

## Why This Matters for Client Work

This setup mirrors real-world Stripe integrations used in production:

* Ensures **idempotency** and **data integrity** (no duplicate billing)
* Separates UI, server logic, and webhook handling clearly
* Verifies all webhook signatures before updating records
* Works out-of-the-box with Stripe test and live environments
* Easy to adapt for subscription-based or multi-product scenarios

For freelancers or small teams, this repository demonstrates that you can build a secure, maintainable payment system that meets professional standards.

---

## Project Status

* **Week 4 – Checkout & Security** ✅ Completed
* **Week 5 – Webhook & Success Page** ✅ Completed
* Next: Cancel page, 3D Secure (PaymentIntent), and customer portal integration

---

## Getting Started

```bash
git clone https://github.com/yourname/stripe-mini-payments
cd stripe-mini-payments
cp .env.example .env.local
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)
and click “Pay with Stripe” to test the flow.

---

## License

MIT License — free to use for learning, demos, or client projects.

---

### (日本語補足メモ)

このREADMEはDay24（Webhook + 成功ページ）までの成果を含み、
「支払い成功 → Webhook通知 → DB更新 → UI表示」までの完全フローを示しています。
実務案件でもそのまま再利用できる構成と説明になっています。

