
# 🧾 Stripe Mini Payments

> Minimal **Next.js + Stripe Checkout** demo with secure server patterns.
> Built for learning and small production use.

---

## ⚙️ Tech Stack

* **Next.js (Pages Router)** — simple API routes, full TypeScript
* **Prisma + PostgreSQL (Supabase)** — minimal DB for payment request dedupe
* **Stripe Checkout (One-time Payment)** — safe server-fixed price flow
* **Tailwind CSS** — clean UI (one-click payment button)
* **Security layers**

    * CSRF token (double-submit pattern)
    * Origin allowlist
    * Rate limit (Upstash Redis + in-memory fallback)
    * Zod validation for request schema

---

## 🎯 Why this repo?

A **tiny but realistic** Stripe integration, reusable for client work or small teams.
Designed for clarity and production-lean setup:

* Fast local start (`npm run dev`)
* Clearly separated **TEST vs LIVE** environments
* Opinionated defaults for security and error handling
* Easy to extend to subscriptions or webhooks

---

## ✅ Features Completed (Phase 1)

| Feature                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| **/api/stripe/ping**     | Minimal endpoint to verify Stripe key (`acct_...` check)  |
| **/api/stripe/checkout** | One-time payment, fixed server-side price                 |
| **CSRF Protection**      | Double-submit cookie (`csrf_token`)                       |
| **Origin Allowlist**     | Rejects requests from unknown domains                     |
| **Rate Limit**           | 5 requests / min per IP per route                         |
| **Validation (Zod)**     | Enforces strict request body structure                    |
| **Structured Logging**   | Logs include `request_id`, `clientRef`, `idempotency_key` |
| **Error Mapping**        | Stripe error → clean HTTP 4xx/5xx response                |
| **Tailwind UI**          | Simple “Stripeで支払う” button with loading state             |

---

## 🚧 Next Steps (Phase 2)

* **Webhook handling** (`/api/stripe/webhook`)
  Verify signatures + idempotent DB updates (`checkout.session.completed`)
* **Success / Cancel pages**
  User feedback after payment completion or cancellation
* **Monitoring & audit logs**
  Checkout error rates, user × amount × timestamp tracking

---

## 🗓️ Project Status

* **Week 4 – Checkout & Security** ✅ (Phase 1 done)
* **Week 5 – Webhooks & Portal** ⏳ (next milestone)

---

## 🧰 Quick Start

```bash
git clone https://github.com/yourname/stripe-mini-payments
cd stripe-mini-payments
cp .env.example .env.local
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)
and click **「Stripeで支払う」** to test the checkout flow.

---

## 📸 Screenshots

* ✅ Checkout API logs showing session creation
* ✅ Stripe Checkout page (test mode)
* ✅ Dashboard payment success (Succeeded)

---

## 🧠 Notes for Client Work

This repo demonstrates **Phase 1** of a secure Stripe integration.
Add **webhook + DB updates + monitoring** for team or mid-scale production use.

---

## 🪪 License

MIT — use freely in client projects, learning, and demos.