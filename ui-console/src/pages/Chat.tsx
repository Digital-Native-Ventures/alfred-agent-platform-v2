import { useState } from "react";
import { useArchitectChat } from "../chat/useArchitectChat";

export default function Chat() {
  const { messages, send } = useArchitectChat();
  const [input, setInput] = useState("");
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className="inline-block rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800">
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <form
        className="p-4 border-t flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput("");
        }}
      >
        <input
          className="flex-1 rounded-lg border px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the Architect…"
        />
        <button className="rounded-lg px-4 py-2 bg-blue-600 text-white">Send</button>
      </form>
    </div>
  );
}