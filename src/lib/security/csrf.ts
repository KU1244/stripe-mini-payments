// src/lib/security/csrf.ts
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE = "csrf_token";
const isDev = process.env.NODE_ENV !== "production"; // ← 追加：開発判定

// Issue a CSRF token and set cookie (SameSite=Lax)
export function setCsrfCookie(res: NextApiResponse): string {
    const token = randomBytes(32).toString("hex");
    const cookie = serialize(CSRF_COOKIE, token, {
        httpOnly: false,   // double-submit なので読み取り可
        secure: !isDev,    // ← ここを修正：開発はfalse、本番はtrue
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,   // 1h
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

    const a = new TextEncoder().encode(fromCookie);
    const b = new TextEncoder().encode(fromHeader);
    if (a.byteLength !== b.byteLength) return false;

    return timingSafeEqual(a, b);
}
