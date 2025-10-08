// src/lib/security/csrf.ts
// English comments for repo readability

import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
// Import only specific functions from Node's "crypto" to avoid type conflicts
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE = "csrf_token";

// Issue a CSRF token and set cookie (SameSite=Lax)
export function setCsrfCookie(res: NextApiResponse): string {
    const token = randomBytes(32).toString("hex");
    const cookie = serialize(CSRF_COOKIE, token, {
        httpOnly: false, // double-submit cookie needs readable cookie
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1h
    });
    res.setHeader("Set-Cookie", cookie);
    return token;
}

// Read token from cookie
export function getCsrfFromCookie(req: NextApiRequest): string | null {
    const raw = req.headers.cookie ?? "";
    if (!raw) return null;
    const cookies = Object.fromEntries(
        raw.split(";").map((v) => {
            const i = v.indexOf("=");
            return [v.slice(0, i).trim(), decodeURIComponent(v.slice(i + 1))];
        })
    );
    return (cookies[CSRF_COOKIE] as string) || null;
}

// Verify equality between header and cookie (timing-safe)
export function verifyCsrf(req: NextApiRequest): boolean {
    const fromCookie = getCsrfFromCookie(req);
    const fromHeader = (req.headers["x-csrf-token"] as string) || "";
    if (!fromCookie || !fromHeader) return false;

    // Use Uint8Array (ArrayBufferView) to satisfy timingSafeEqual's signature
    // TextEncoder is built-in in Node 18+ and avoids Buffer type friction.
    const a = new TextEncoder().encode(fromCookie);
    const b = new TextEncoder().encode(fromHeader);

    // timingSafeEqual throws if byte lengths differ → check first
    if (a.byteLength !== b.byteLength) return false;

    return timingSafeEqual(a, b);
}
