// src/pages/index.tsx
import { useEffect, useState } from "react";

// Cookieから値を取り出す関数
function getCookie(name: string): string | undefined {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")[1];
}

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ページを開いたときにCSRFクッキーをもらう
    useEffect(() => {
        fetch("/api/csrf", { credentials: "same-origin" })
            .catch(() => setMessage("CSRF取得に失敗しました"));
    }, []);

    // 支払いボタンが押されたとき
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
                window.location.href = data.url; // Stripe決済ページへ遷移
            } else {
                setMessage(data.error || "不明なエラーです");
            }
        } catch {
            setMessage("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-[340px] text-center">
                <h1 className="text-2xl font-bold mb-2">Mini Payment</h1>
                <p className="text-gray-500 mb-6">$1.00 のテスト決済</p>

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "処理中..." : "Stripeで支払う"}
                </button>

                {message && (
                    <p className="mt-4 text-sm text-red-500 font-medium">{message}</p>
                )}

                <p className="mt-6 text-xs text-gray-400">
                    ※このボタンはStripeテスト環境で動作します。
                </p>
            </div>
        </main>
    );
}
