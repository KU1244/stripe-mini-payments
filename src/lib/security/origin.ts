// English comments for repo readability
import type { NextApiRequest } from "next";

const ALLOWED = new Set<string>([
    "http://localhost:3000",
    "https://your-domain.example", // add production domains
]);

export function isAllowedOrigin(req: NextApiRequest): boolean {
    const origin = (req.headers.origin || req.headers.referer || "") as string;
    // Normalize: get scheme://host[:port]
    try {
        const url = new URL(origin);
        const key = `${url.protocol}//${url.host}`;
        return ALLOWED.has(key);
    } catch {
        return false;
    }
}
