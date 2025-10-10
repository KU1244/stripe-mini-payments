// src/pages/success.tsx
import Link from "next/link";

export default function SuccessPage() {
    return (
        // Fullscreen centered layout for the success message
        <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-[360px] text-center">
                {/* Heading: Payment success message */}
                <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>

                {/* Description: Indicates this page appears after Stripe Checkout success */}
                <p className="text-gray-600 mb-6">
                    Thank you for testing the payment.<br />
                    This page appears after Stripe Checkout completes successfully.
                </p>

                {/* Link: Navigate back to the home page */}
                <Link
                    href="/"
                    className="inline-block px-4 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                    Back to Home
                </Link>

                {/* Note: Final payment confirmation handled by the server-side Webhook */}
                <p className="mt-6 text-xs text-gray-400">
                    *The actual confirmation is handled by the server Webhook.
                </p>
            </div>
        </main>
    );
}
