// src/lib/stripeClient.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    // apiVersion: "2024-06-20",
    maxNetworkRetries: 2,
    timeout: 15_000,
});
