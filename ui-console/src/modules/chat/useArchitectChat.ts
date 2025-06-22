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
      // Use GET endpoint for EventSource (SSE only supports GET)
      eventSourceRef.current = new EventSource(`${endpoint}/stream`);
      
      eventSourceRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "chunk") {
          // Append chunk to the last assistant message
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content += data.content;
            }
            return newMessages;
          });
        } else if (data.type === "done") {
          // Streaming complete
          setIsStreaming(false);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE error:", error);
        setIsStreaming(false);
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        
        // Update last message with error
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === "assistant" && !lastMessage.content) {
            lastMessage.content = "Sorry, I encountered an error. Please try again.";
          }
          return newMessages;
        });
      };

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
  }, [messages, endpoint]);

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