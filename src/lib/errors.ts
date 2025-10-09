import Stripe from "stripe";

export function mapStripeError(e: unknown): { status: number; code: string; message: string } {
    if (e instanceof Stripe.errors.StripeError) {
        // user-caused 4xx vs server 5xx (rough mapping)
        const isUser = e.type === "StripeCardError" || e.type === "StripeInvalidRequestError" || e.type === "StripePermissionError";
        return { status: isUser ? 400 : 502, code: e.code || e.type, message: e.message };
    }
    return { status: 500, code: "internal_error", message: "Internal Server Error" };
}
