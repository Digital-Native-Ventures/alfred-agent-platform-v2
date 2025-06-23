import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, Loader, RotateCcw, StopCircle } from "lucide-react";
import { useStreamChat } from "../../hooks/useStreamChat";
import MessageBubble from "../../components/chat/MessageBubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ChatPanelStream() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [inFlightId, setInFlightId] = useState<string | null>(null);
  const inFlightIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onChunk = useCallback((delta: string) => {
    console.log('onChunk called with delta:', JSON.stringify(delta));
    setMessages(prev => {
      // Find the last assistant message
      let lastAssistantIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === 'assistant') {
          lastAssistantIndex = i;
          break;
        }
      }
      if (lastAssistantIndex === -1) {
        console.log('No assistant message found');
        return prev;
      }
      
      const updated = [...prev];
      updated[lastAssistantIndex] = {
        ...updated[lastAssistantIndex],
        content: updated[lastAssistantIndex].content + delta
      };
      
      console.log('Updated message at index', lastAssistantIndex, 'new content length:', updated[lastAssistantIndex].content.length);
      return updated;
    });
  }, []);

  const { loading: isStreaming, error: streamError, cancel } = useStreamChat(currentPrompt, onChunk);

  // Remove the automatic cleanup - let streaming complete naturally

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: input.trim(),
        timestamp: new Date().toISOString()
      };
      
      const assistantMsg: Message = {
        id: crypto.randomUUID(), 
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString()
      };

      console.log('Creating assistant message with ID:', assistantMsg.id);
      
      // Set inFlightId BEFORE setting messages and prompt
      setInFlightId(assistantMsg.id);
      inFlightIdRef.current = assistantMsg.id;
      console.log('Set inFlightId to:', assistantMsg.id);
      
      // Add messages
      setMessages(prev => [...prev, userMsg, assistantMsg]);
      
      // Start streaming last to ensure inFlightId is set
      setTimeout(() => {
        console.log('Starting stream with inFlightId:', assistantMsg.id);
        console.log('Current inFlightIdRef.current:', inFlightIdRef.current);
        setCurrentPrompt(input.trim());
      }, 0);
      
      setInput("");
    }
  };

  // Debug function to test message display
  const addTestMessage = () => {
    const testMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "This is a test message to verify rendering works!",
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, testMsg]);
  };

  // Debug function to test onChunk directly
  const testOnChunk = () => {
    console.log('Testing onChunk directly...');
    console.log('Current inFlightIdRef.current:', inFlightIdRef.current);
    console.log('Current inFlightId state:', inFlightId);
    console.log('Current messages:', messages.map(m => ({ id: m.id, role: m.role, content: m.content.substring(0, 20) + '...' })));
    
    if (inFlightIdRef.current) {
      console.log('Calling onChunk with "TEST"');
      onChunk('TEST');
    } else {
      console.log('No inFlightIdRef.current set!');
    }
  };

  const handleCancel = () => {
    cancel();
    setCurrentPrompt(null);
    setInFlightId(null);
    inFlightIdRef.current = null;
  };

  const handleRegenerate = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage.role === "user") {
        // Remove last assistant message and regenerate
        setMessages(prev => prev.slice(0, -1));
        const newAssistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant", 
          content: "",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newAssistantMsg]);
        setInFlightId(newAssistantMsg.id);
        inFlightIdRef.current = newAssistantMsg.id;
        setCurrentPrompt(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0" style={{ position: 'relative', zIndex: 10 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Architect Assistant</h1>
            <p className="text-sm text-gray-500">Streaming responses with markdown support</p>
          </div>
          <button 
            onClick={addTestMessage}
            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm"
          >
            Add Test Message
          </button>
          <button 
            onClick={testOnChunk}
            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm ml-2"
            style={{ backgroundColor: '#fef3c7', color: '#d97706', cursor: 'pointer' }}
          >
            Test onChunk
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0" style={{ isolation: 'isolate' }}>
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Start a conversation with the Architect Assistant</p>
            <p className="text-sm text-gray-400 mt-2">Experience real-time streaming responses with markdown support</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
            <MessageBubble role={message.role} content={message.content} />
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader className="animate-spin h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Streaming response...</span>
            </div>
          </div>
        )}

        {streamError && (
          <div className="flex justify-start mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <p className="text-sm text-red-600">Error: {streamError.message}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      {(isStreaming || messages.length > 0) && (
        <div className="px-6 py-2 border-t bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            {isStreaming && (
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
              >
                <StopCircle size={14} />
                Cancel
              </button>
            )}
            {!isStreaming && messages.length > 0 && (
              <button
                onClick={handleRegenerate}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
              >
                <RotateCcw size={14} />
                Regenerate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-white border-t px-6 py-4 flex-shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about architecture, design patterns, or system design..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-400"
            style={{ boxSizing: 'border-box', minWidth: 0, color: '#111827', backgroundColor: '#ffffff' }}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}