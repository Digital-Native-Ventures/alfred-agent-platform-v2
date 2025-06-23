import { useEffect, useRef, useState } from "react";
export function useArchitectChat(sessionId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const src = useRef<EventSource | null>(null);

  // preload history
  useEffect(() => {
    fetch(`/api/chat/history?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]); // fallback for error responses
        }
      })
      .catch(() => setMessages([]));
  }, [sessionId]);

  // send message
  async function send(text: string) {
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: text })
    });

    src.current?.close();
    src.current = new EventSource(`/api/chat/stream?session_id=${sessionId}`);
    src.current.onmessage = ev => {
      const { role, delta, saved } = JSON.parse(ev.data);
      setMessages(m => [...m, { role, content: delta, saved }]);
    };
  }
  return { messages, send };
}