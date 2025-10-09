// English comments for repo readability
import type { NextApiRequest } from "next";

// Allowlist for accepted origins (local + production)
const ALLOWED = new Set<string>([
    "http://localhost:3000",           // local dev
    "http://127.0.0.1:3000",           // some browsers use this form
    "https://your-production-domain.com", // replace with real domain
]);

/**
 * Check if request comes from an allowed Origin or Referer.
 * Used to block cross-site requests.
 */
export function isAllowedOrigin(req: NextApiRequest): boolean {
    const origin = (req.headers.origin || req.headers.referer || "") as string;

    try {
        // Normalize: only keep protocol://host[:port]
        const url = new URL(origin);
        const key = `${url.protocol}//${url.host}`;

        // Match against allowlist
        return ALLOWED.has(key);
    } catch {
        // Invalid URL or missing header
        return false;
    }
}
