"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Coragen dosage for cotton armyworm",
  "How to track my order?",
  "Wheat fertilizer schedule (Urea & DAP)",
  "What are payment methods?",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Furrowmark Multan Depot Advisory. How can we assist you with crop protection, fertilizers, seed varieties, or order status today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, conversationId }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        if (data.conversationId) setConversationId(data.conversationId);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I could not process your message right now.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error occurred. Please try again or reach our WhatsApp hotline at +92 300 5534323.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-16 md:bottom-6 right-3 sm:right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white px-3.5 sm:px-4 py-2.5 rounded-full shadow-lg font-semibold text-xs sm:text-sm flex items-center gap-2 border border-emerald-700 transition"
          aria-label="Open support chat"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          <span className="hidden xs:inline">Agronomist Assistant</span>
          <span className="xs:hidden">Chat</span>
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-[92vw] xs:w-84 sm:w-96 flex flex-col h-[460px] max-h-[75vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-emerald-900 text-white p-3.5 flex justify-between items-center border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <div>
                <h2 className="font-bold text-sm tracking-tight leading-none">Furrowmark Support</h2>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  Grounded Agronomic & Order Advisory
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-200 hover:text-white p-1 rounded-lg transition"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick prompt suggestions when few messages */}
          {messages.length <= 2 && (
            <div className="bg-gray-50 border-b border-gray-100 p-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="bg-white border border-gray-200 hover:border-emerald-600 hover:text-emerald-800 text-[11px] text-gray-700 px-2 py-1 rounded-md shrink-0 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs sm:text-sm bg-gray-50/40">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-emerald-700 text-white ml-auto rounded-tr-none shadow-xs"
                    : "bg-white text-gray-800 border border-gray-200 mr-auto rounded-tl-none shadow-xs whitespace-pre-line"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-emerald-700 font-medium italic p-2 bg-emerald-50 rounded-lg w-fit border border-emerald-100">
                Agronomist desk checking formulation records...
              </div>
            )}
          </div>

          {/* Message input Form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2.5 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask dosage, order status, crop problem..."
              className="border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm flex-1 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-900 active:scale-95 disabled:opacity-50 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
