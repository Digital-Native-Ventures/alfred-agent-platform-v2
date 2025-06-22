import { useState, useCallback, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useArchitectChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const endpoint = import.meta.env.VITE_ARCHITECT_CHAT_ENDPOINT || "/api/chat";

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = { role: "user", content };
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Initialize assistant message
    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Send message to backend using simple POST
      const response = await fetch(`${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update assistant message with response
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.content = data.response || "No response received.";
        }
        return newMessages;
      });
      
      setIsStreaming(false);

    } catch (error) {
      console.error("Failed to send message:", error);
      setIsStreaming(false);
      
      // Update last message with error
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.content = "Failed to connect to the chat service. Please check your connection.";
        }
        return newMessages;
      });
    }
  }, [endpoint]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    eventSourceRef.current?.close();
  }, []);

  return {
    messages,
    sendMessage,
    isStreaming,
    cleanup,
  };
}