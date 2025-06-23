import { useEffect, useRef, useState } from "react";

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
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json() as Promise<{ response: string }>;
      })
      .then(({ response }) => {
        const reply = response || "";
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
      .catch(err => { if (err.name !== "AbortError") setError(err); })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [prompt]);

  const cancel = () => controllerRef.current?.abort();
  return { loading, error, cancel };
}