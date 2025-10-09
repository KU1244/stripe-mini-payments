///api/stripe/checkout
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { stripe } from "@/lib/stripeClient";
import { limit } from "@/lib/rateLimit";
import { verifyCsrf } from "@/lib/security/csrf";
import { isAllowedOrigin } from "@/lib/security/origin";
import { CheckoutRequest } from "@/lib/validation/checkout";
import { logInfo, logError } from "@/lib/logger";
import { mapStripeError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Server-fixed settings (do not accept from client)
const PRICE_ID = "price_1SGHo0Kx1jk8KdghqaD2xOip"; // TODO: replace
const SUCCESS_URL = "http://localhost:3000/success"; // TODO: add production domains
const CANCEL_URL = "http://localhost:3000/cancel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "method_not_allowed" });
    }

    // Origin/Referer allowlist
    if (!isAllowedOrigin(req)) {
        return res.status(403).json({ error: "forbidden_origin" });
    }

    // Content-Type: application/json only
    if (!/application\/json/.test(req.headers["content-type"] || "")) {
        return res.status(415).json({ error: "unsupported_media_type" });
    }

    // CSRF: double submit cookie (x-csrf-token == cookie)
    if (!verifyCsrf(req)) {
        return res.status(403).json({ error: "invalid_csrf" });
    }

    // Rate limit: 5/min per IP for this route
    const rl = await limit(req, "/api/stripe/checkout");
    if (!rl.success) {
        res.setHeader("Retry-After", Math.ceil((rl.reset - Date.now()) / 1000));
        return res.status(429).json({ error: "rate_limited" });
    }

    // Validate body shape (even if empty), future-proof
    try {
        CheckoutRequest.parse(req.body || {});
    } catch {
        return res.status(400).json({ error: "bad_request" });
    }

    // Generate clientRef (unique DB guard) and Idempotency-Key for Stripe
    const clientRef = crypto.randomUUID();
    const idemKey = crypto.randomUUID();

    try {
        // Pre-insert a unique row to block duplicate clicks
        await prisma.paymentRequest.create({
            data: { clientRef, status: "pending" },
        });
    } catch (e) {
        // Unique violation means duplicated click
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return res.status(409).json({ error: "duplicate_click" });
        }
        logError("db_insert_error", { clientRef, err: String(e) });
        return res.status(500).json({ error: "internal_error" });
    }

    try {
        // Create Checkout Session with idempotency
        const session = await stripe.checkout.sessions.create(
            {
                mode: "payment",
                line_items: [{ price: PRICE_ID, quantity: 1 }],
                success_url: SUCCESS_URL,
                cancel_url: CANCEL_URL,
            },
            { idempotencyKey: idemKey }
        );

        logInfo("checkout_session_created", {
            request_id: req.headers["x-request-id"] || null,
            clientRef,
            idemKey,
            session: session.id,
            rlRemaining: rl.remaining,
        });

        return res.status(200).json({ url: session.url, clientRef, requestId: req.headers["x-request-id"] || null });
    } catch (e) {
        const mapped = mapStripeError(e);
        logError("stripe_error", {
            request_id: req.headers["x-request-id"] || null,
            clientRef,
            idemKey,
            stripe: mapped,
        });
        return res.status(mapped.status).json({ error: mapped.code, message: mapped.message });
    }
}
