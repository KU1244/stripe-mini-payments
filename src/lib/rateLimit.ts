// English comments for repo readability
import type { NextApiRequest } from "next";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Result = { success: boolean; remaining: number; reset: number };

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const limiter = hasUpstash
    ? new Ratelimit({
        redis: new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        }),
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 per minute
        analytics: false,
        prefix: "rl",
    })
    : null;

// simple in-memory fallback
const memory = new Map<string, { count: number; resetAt: number }>();

export async function limit(req: NextApiRequest, route: string): Promise<Result> {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const key = `${route}:${ip}`;

    if (limiter) {
        const r = await limiter.limit(key);
        return { success: r.success, remaining: r.remaining, reset: r.reset };
    }

    const now = Date.now();
    const rec = memory.get(key);
    if (!rec || rec.resetAt < now) {
        memory.set(key, { count: 1, resetAt: now + 60_000 });
        return { success: true, remaining: 4, reset: now + 60_000 };
    }
    if (rec.count >= 5) return { success: false, remaining: 0, reset: rec.resetAt };
    rec.count += 1;
    return { success: true, remaining: 5 - rec.count, reset: rec.resetAt };
}
