"use client";

export default function ConnectOpenRouter() {
    const connect = () => {
        window.location.href =
            `${process.env.NEXT_PUBLIC_API_URL}/api/integrations/openrouter/start`;
    };
    return (
        <div className="flex items-center justify-center h-screen">
            <button
                onClick={connect}
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium transition-colors"
            >
                Connect OpenRouter
            </button>
        </div>
    );
}