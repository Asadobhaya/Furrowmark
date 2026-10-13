"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Furrowmark Agricultural Support. Ask about crop products, live stock, order status, or emergency first aid guidelines.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
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
          content: "Network error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-800 hover:bg-green-900 text-white px-4 py-2.5 rounded-full shadow-lg font-medium text-sm flex items-center space-x-2 border border-green-700"
          aria-label="Open support chat"
        >
          <span>Ask Furrowmark Assistant</span>
        </button>
      ) : (
        <div className="bg-white border rounded-lg shadow-xl w-80 sm:w-96 flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-green-800 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div>
              <h2 className="font-bold text-sm">Furrowmark Support</h2>
              <p className="text-xs text-green-200">
                Grounded Agricultural Assistant
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-sm px-2 py-0.5 rounded"
              aria-label="Close chat"
            >
              Close
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded ${
                  m.role === "user"
                    ? "bg-green-50 text-green-950 border border-green-200 ml-6"
                    : "bg-gray-100 text-gray-900 mr-6 whitespace-pre-line"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-gray-500 italic p-1">
                Assistant is checking records...
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="border-t p-2 flex gap-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, orders, policies..."
              className="border rounded px-2.5 py-1.5 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-green-700"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-green-800 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-900 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
