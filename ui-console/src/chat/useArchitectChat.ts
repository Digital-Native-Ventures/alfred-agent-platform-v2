import { useState } from "react";

export function useArchitectChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const send = async (content: string) => {
    const userMsg = { role: "user", content };
    setMessages((m) => [...m, userMsg]);

    const ev = new EventSource(`/api/chat/architect`);
    ev.addEventListener("message", (e) => {
      setMessages((m) => [...m, JSON.parse(e.data)]);
    });
    ev.addEventListener("error", () => ev.close());

    await fetch("/api/chat/architect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });
  };
  return { messages, send };
}