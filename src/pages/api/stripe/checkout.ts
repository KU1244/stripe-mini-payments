// Minimal one-time Checkout (no DB, no auth, no CSRF)
// Pages Router / Node runtime

import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeClient";

const PRICE_ID = process.env.STRIPE_PRICE_ID!;
const APP_URL  = process.env.APP_URL!;

type Resp = { url: string } | { error: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Resp>
) {
    // Allow POST only
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "method_not_allowed" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{ price: PRICE_ID, quantity: 1 }],
            success_url: `${APP_URL}/?success=1`,
            cancel_url: `${APP_URL}/?canceled=1`,
        });

        // session.url can be null; fail fast if so
        if (!session.url) {
            return res.status(500).json({ error: "no_checkout_url" });
        }
        return res.status(200).json({ url: session.url });
    } catch {
        return res.status(500).json({ error: "create_session_failed" });
    }
}
