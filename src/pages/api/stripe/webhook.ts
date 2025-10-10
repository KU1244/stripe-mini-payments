// src/pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/lib/stripeClient";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import getRawBody from "raw-body"; // Use raw-body to read raw request data

// Stripe webhook signature verification requires raw body, so disable JSON parser
export const config = {
    api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST method for webhooks
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    // Validate headers and server configuration
    if (!sig || typeof sig !== "string") return res.status(400).json({ error: "missing_signature" });
    if (!secret) return res.status(500).json({ error: "server_misconfigured" });

    // 1) Verify signature using raw body
    let event: Stripe.Event;
    try {
        const raw = await getRawBody(req); // Returns Buffer, no import for Buffer needed
        event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch {
        return res.status(400).json({ error: "invalid_signature" });
    }

    // 2) Prevent replay attacks by storing unique event.id
    try {
        await prisma.eventLog.create({
            data: { eventId: event.id, type: event.type },
        });
    } catch (e) {
        const isDup =
            e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
        if (isDup) return res.status(200).json({ ok: true, replay: true }); // Ignore duplicates
        return res.status(500).json({ error: "internal_error" });
    }

    // 3) Handle event types (minimal example)
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await prisma.payment.upsert({
                    where: { stripeSessionId: session.id },
                    update: {
                        status: "paid",
                        amount: session.amount_total ?? 0,
                        currency: session.currency ?? "usd",
                    },
                    create: {
                        stripeSessionId: session.id,
                        amount: session.amount_total ?? 0,
                        currency: session.currency ?? "usd",
                        status: "paid",
                    },
                });
                break;
            }

            case "checkout.session.async_payment_failed":
            case "checkout.session.expired": {
                const session = event.data.object as Stripe.Checkout.Session;
                await prisma.payment.upsert({
                    where: { stripeSessionId: session.id },
                    update: { status: "failed" },
                    create: {
                        stripeSessionId: session.id,
                        amount: session.amount_total ?? 0,
                        currency: session.currency ?? "usd",
                        status: "failed",
                    },
                });
                break;
            }

            default:
                // Return 200 for unhandled events to stop further retries
                break;
        }

        return res.status(200).json({ ok: true });
    } catch {
        return res.status(500).json({ error: "internal_error" });
    }
}
