// Minimal Stripe connectivity check (no env/rate-limit)
//src/pages/api/stripe/ping.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeClient";

type Resp =
    | { ok: true; account: { id: string } }
    | { ok: false; error: string };

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse<Resp>
) {
  try {
    const acc = await stripe.accounts.retrieve();
    res.status(200).json({ ok: true, account: { id: acc.id } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    res.status(500).json({ ok: false, error: msg });
  }
}
