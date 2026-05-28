"use client";

import { useState } from "react";
import { Send, Paperclip, MessageSquare } from "lucide-react";

const mockMessages = [
  { id: "1", sender: "agency", name: "Alice Chen", message: "Hi! Just wanted to update you that the homepage redesign is 80% complete. We'll have a preview ready by Friday.", time: "2 hours ago", avatar: "AC" },
  { id: "2", sender: "client", name: "John Doe", message: "Great news! Looking forward to seeing it. Please make sure the mobile version is prioritized.", time: "1 hour ago", avatar: "JD" },
  { id: "3", sender: "agency", name: "Alice Chen", message: "Absolutely, mobile-first approach is our standard. I'll send you the preview link as soon as it's ready.", time: "30 minutes ago", avatar: "AC" },
];

export default function PortalMessagesPage() {
  const [messages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-4">
      <header className="flex justify-between items-center py-4 px-2 mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Messages</h1>
        </div>
      </header>

      <div className="glass-panel flex-1 flex flex-col rounded-3xl mx-2 border border-white/5 overflow-hidden">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "client" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  msg.sender === "agency"
                    ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
                    : "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                }`}
              >
                {msg.avatar}
              </div>
              <div className={`max-w-md ${msg.sender === "client" ? "text-right" : ""}`}>
                <div className={`flex items-center gap-2 mb-1 ${msg.sender === "client" ? "justify-end" : ""}`}>
                  <span className="text-sm font-medium text-white">{msg.name}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === "agency"
                      ? "bg-[#222226] text-gray-200"
                      : "bg-emerald-500/20 text-emerald-100"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#222226] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button className="p-2.5 rounded-xl bg-white text-gray-900 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}