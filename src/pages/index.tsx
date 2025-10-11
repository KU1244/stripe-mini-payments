// src/pages/index.tsx
import { useEffect, useState } from "react";

// Helper: Read a specific cookie value
function getCookie(name: string): string | undefined {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")[1];
}

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch CSRF cookie when the page loads
    useEffect(() => {
        fetch("/api/csrf", { credentials: "same-origin" })
            .catch(() => setMessage("Failed to get CSRF token"));
    }, []);

    // Handle Stripe Checkout button click
    const handleCheckout = async () => {
        setLoading(true);
        setMessage("");

        const csrf = getCookie("csrf_token") || "";

        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrf,
                },
                body: JSON.stringify({}),
                credentials: "same-origin",
            });

            const data = await res.json();

            if (res.ok && data.url) {
                // Redirect to Stripe Checkout page
                window.location.href = data.url;
            } else {
                setMessage(data.error || "Unknown error occurred");
            }
        } catch {
            setMessage("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-[340px] text-center">
                <h1 className="text-2xl font-bold mb-2">Mini Payment</h1>
                <p className="text-gray-500 mb-6">Test payment for $1.00</p>

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Processing..." : "Pay with Stripe"}
                </button>

                {message && (
                    <p className="mt-4 text-sm text-red-500 font-medium">{message}</p>
                )}

                <p className="mt-6 text-xs text-gray-400">
                    *This button works in the Stripe test environment.
                </p>
            </div>
        </main>
    );
}
