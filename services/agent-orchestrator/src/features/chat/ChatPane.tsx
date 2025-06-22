import { useState } from "react";
import { Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatPane() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm the Architect AI. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const threadId = "local-dev-" + Date.now();

  async function exportChat() {
    try {
      // Use the NEXT_PUBLIC_ARCHITECT_URL environment variable
      const architectUrl = "http://localhost:8083";
      
      const res = await fetch(`${architectUrl}/architect/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          thread_id: threadId, 
          messages: messages 
        }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const md = await res.text();
      const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `architect-chat-${threadId}.md`,
      });
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: "Chat exported ✨",
        description: "Your chat has been downloaded as a Markdown file"
      });
    } catch (e) {
      toast({ 
        title: "Export failed", 
        description: String(e), 
        variant: "destructive" 
      });
    }
  }

  async function sendMessage() {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const architectUrl = "http://localhost:8083";
      
      // Create a placeholder assistant message that we'll update with streaming content
      const assistantMessageId = Date.now();
      const initialAssistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, initialAssistantMessage]);

      // Make the streaming request to /architect/complete
      const response = await fetch(`${architectUrl}/architect/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.content,
          context: [] // Add context if needed
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle Server-Sent Events streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantContent += data.content;
                  
                  // Update the assistant message with the accumulated content
                  setMessages(prev => prev.map((msg, index) => 
                    index === prev.length - 1 && msg.role === "assistant"
                      ? { ...msg, content: assistantContent }
                      : msg
                  ));
                }
              } catch (parseError) {
                // Skip malformed JSON chunks
                console.warn("Failed to parse SSE data:", parseError);
              }
            }
          }
        }
      }

      setIsLoading(false);
    } catch (e) {
      toast({
        title: "Error sending message",
        description: String(e),
        variant: "destructive"
      });
      setIsLoading(false);
      
      // Remove the failed assistant message if it was added
      setMessages(prev => prev.filter(msg => 
        !(msg.role === "assistant" && msg.content === "")
      ));
    }
  }

  return (
    <div className="flex flex-col h-full group">
      {/* Chat Header with Export Button */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div>
          <h2 className="text-lg font-semibold">Architect Chat</h2>
          <p className="text-sm text-muted-foreground">
            Thread: {threadId}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportChat}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Export chat as Markdown"
        >
          <Download className="h-4 w-4" />
        </Button>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.role === "user" ? "You" : "Architect"}
                </div>
                <div className="text-sm">{message.content}</div>
                {message.timestamp && (
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-lg px-3 py-2 bg-muted">
                <div className="text-sm font-medium mb-1">Architect</div>
                <div className="text-sm">Thinking...</div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !inputValue.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}