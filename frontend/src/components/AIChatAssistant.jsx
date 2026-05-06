import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { useShop } from "../context/ShopContex";

const starterPrompts = [
    "Recommend me some products",
    "Find items under 200",
    "What is your return policy?",
];

const AIChatAssistant = () => {
    const { backendUrl, addToCart } = useShop();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showStarterPrompts, setShowStarterPrompts] = useState(true);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            type: "text",
            reply: "Hi, I’m your ForeverBuy AI assistant. I can help with recommendations, product search, order questions, shipping, and returns.",
        },
    ]);

    const canSend = useMemo(() => message.trim().length > 0 && !isLoading, [message, isLoading]);
    const hasUserMessages = useMemo(() => messages.some((entry) => entry.role === "user"), [messages]);
    const shouldShowStarterPrompts = showStarterPrompts || !hasUserMessages;

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setMessages((prev) => [...prev, { role: "user", type: "text", reply: trimmed }]);
        setShowStarterPrompts(false);
        setMessage("");
        setIsLoading(true);

        try {
            const res = await axios.post(
                `${backendUrl}/api/ai/chat`,
                { message: trimmed },
                { withCredentials: true }
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    type: res.data.type || "text",
                    reply: res.data.reply,
                    products: res.data.products || [],
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    type: "text",
                    reply: error?.response?.data?.message || "The assistant is unavailable right now.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed bottom-5 right-5 z-50 rounded-full bg-black px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-gray-800"
            >
                {isOpen ? "Close Assistant" : "AI Assistant"}
            </button>

            {isOpen && (
                <div className="fixed bottom-20 right-4 z-50 flex h-[75vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                    <div className="bg-black px-5 py-4 text-white">
                        <p className="text-lg font-semibold">ForeverBuy Assistant</p>
                        <p className="text-sm text-gray-300">Smart recommendations, FAQs, order help, and search assistance.</p>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-4">
                        {messages.map((entry, index) => (
                            <div key={`${entry.role}-${index}`} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${entry.role === "user" ? "bg-black text-white" : "bg-white text-gray-800"}`}>
                                    <p>{entry.reply}</p>

                                    {entry.type === "products" && entry.products?.length > 0 && (
                                        <div className="mt-3 space-y-3">
                                            {entry.products.map((product) => (
                                                <div key={product._id} className="rounded-2xl border border-gray-200 bg-stone-50 p-3">
                                                    <div className="flex gap-3">
                                                        <img
                                                            src={product.image?.[0]?.url}
                                                            alt={product.name}
                                                            className="h-20 w-16 rounded-xl object-cover"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
                                                            <p className="mt-1 text-xs text-gray-500">{product.category} · {product.subCategory}</p>
                                                            <p className="mt-2 text-sm font-medium">${product.price}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex gap-2">
                                                        <Link
                                                            to={`/product/${product._id}`}
                                                            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => addToCart(product._id, product.sizes?.[0])}
                                                            className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white"
                                                        >
                                                            Add to cart
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 bg-white p-4">
                        {hasUserMessages && (
                            <div className="mb-3 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowStarterPrompts((prev) => !prev)}
                                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-500 hover:text-gray-900"
                                    aria-expanded={shouldShowStarterPrompts}
                                >
                                    {shouldShowStarterPrompts ? "Hide suggestions" : "Suggestions"}
                                </button>
                            </div>
                        )}

                        {shouldShowStarterPrompts && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {starterPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => sendMessage(prompt)}
                                        className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 transition hover:border-gray-500 hover:text-gray-900"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && canSend) {
                                        sendMessage(message);
                                    }
                                }}
                                placeholder="Ask for products, shipping, or your latest order"
                                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => sendMessage(message)}
                                disabled={!canSend}
                                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatAssistant;
