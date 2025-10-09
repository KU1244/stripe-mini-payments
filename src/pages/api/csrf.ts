import type { NextApiRequest, NextApiResponse } from "next";
import { setCsrfCookie } from "@/lib/security/csrf";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "method_not_allowed" });
    }
    const token = setCsrfCookie(res);
    return res.status(200).json({ csrfToken: token });
}
