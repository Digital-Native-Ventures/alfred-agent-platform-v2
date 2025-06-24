import { useEffect, useRef, useState } from "react";
import { normalizeChatResponse } from "../utils/normalizeChatResponse";

/**
 * useStreamChat
 *  - Calls plain POST /api/chat {prompt}
 *  - Expects JSON {reply: "..."} from backend
 *  - Streams the reply word-by-word with 60 ms delay so UI feels live
 *  - Supports cancel via returned cancel() fn
 */
export function useStreamChat(
  prompt: string | null,
  onChunk: (piece: string) => void,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<Error | null>(null);
  const controllerRef         = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!prompt) return;
    setLoading(true); setError(null);

    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, session_id: "chat-session" }),
      signal: ctrl.signal,
    })
      .then(async r => {
        if (!r.ok) {
          const errorText = await r.text();
          console.error("API Error:", errorText);
          throw new Error(`HTTP ${r.status}: ${errorText}`);
        }

        const data = await r.json();
        return normalizeChatResponse(data);
      })
      .then(({ response }) => {
        const reply = response || "";
        
        // Handle empty responses with user feedback
        if (!reply.trim()) {
          if (import.meta.env.MODE === 'development') {
            console.warn("Received empty response from API");
          }
          throw new Error("⚠️ Received empty reply from server");
        }
        const words = reply.split(/(\s+)/);      // keep spaces
        let i = 0;
        const tick = () => {
          if (ctrl.signal.aborted) return;
          if (i < words.length) {
            onChunk(words[i]);
            i += 1;
            setTimeout(tick, 60);                // 👉 feel free to tweak speed
          }
        };
        tick();
      })
      .catch(err => { 
        if (err.name !== "AbortError") {
          setError(err);
          // Reset streaming state on error for proper recovery
          setLoading(false);
        }
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [prompt, onChunk]);

  const cancel = () => controllerRef.current?.abort();
  return { loading, error, cancel };
}