import { z } from "zod";

export const CheckoutRequest = z.object({
    // Future extension: e.g., productKey: z.enum(["starter","pro"]).optional()
}).strict();

export type CheckoutRequest = z.infer<typeof CheckoutRequest>;
