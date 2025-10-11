// src/pages/cancel.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

/**
 * Cancel (or failure) page for Checkout
 * - Shows a generic user-facing message
 * - Optionally displays a request correlation id (?rid=...) to help support
 * - Avoids leaking internal error details (kept in server logs)
 */
export default function CancelPage() {
    const router = useRouter();
    const [rid, setRid] = useState<string>("");

    // Read optional request/correlation id from query (?rid=xxxx)
    useEffect(() => {
        const q = router.query?.rid;
        if (typeof q === "string") setRid(q);
    }, [router.query]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-[360px] text-center">
                <h1 className="text-2xl font-bold mb-2">Order not completed</h1>

                <p className="text-gray-600 mb-4">
                    The payment was canceled.<br />
                    You have not been charged.
                </p>

                {/* Show correlation id only if provided */}
                {rid && (
                    <p className="text-xs text-gray-500 mb-6">
                        Reference ID: <span className="font-mono">{rid}</span>
                    </p>
                )}

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="inline-block px-4 py-2 rounded-xl font-semibold text-white bg-gray-700 hover:bg-gray-800 transition"
                    >
                        Back
                    </Link>

                    {/* Optional: link to support/contact page */}
                    {/* <Link href="/contact" className="text-sm text-blue-600 hover:underline">
            Need help? Contact us
          </Link> */}
                </div>

                <p className="mt-6 text-xs text-gray-400">
                    * Final confirmation is handled by the server-side Webhook.
                </p>
            </div>
        </main>
    );
}
