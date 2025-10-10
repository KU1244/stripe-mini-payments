// src/pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/lib/stripeClient";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import getRawBody from "raw-body"; // 生ボディ取得はこれに統一

// ✅ Stripe署名検証は“生ボディ”必須。NextのJSONパーサをOFF
export const config = {
    api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || typeof sig !== "string") return res.status(400).json({ error: "missing_signature" });
    if (!secret) return res.status(500).json({ error: "server_misconfigured" });

    // 1) 生ボディ取得 → 署名検証
    let event: Stripe.Event;
    try {
        const raw = await getRawBody(req); // Buffer が返る（グローバル Buffer でOK）
        event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch {
        return res.status(400).json({ error: "invalid_signature" });
    }

    // 2) リプレイ防止（event.id を @unique で保存。重複なら即200）
    try {
        await prisma.eventLog.create({
            data: { eventId: event.id, type: event.type },
        });
    } catch (e) {
        const isDup =
            e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
        if (isDup) return res.status(200).json({ ok: true, replay: true });
        return res.status(500).json({ error: "internal_error" });
    }

    // 3) イベント別の処理（最小）
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
                // 未対応は200でOK（再送を止める）
                break;
        }

        return res.status(200).json({ ok: true });
    } catch {
        return res.status(500).json({ error: "internal_error" });
    }
}
