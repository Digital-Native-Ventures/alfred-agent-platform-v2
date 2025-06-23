import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader } from "lucide-react";
import { useArchitectChat } from "./useArchitectChat";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = "550e8400-e29b-41d4-a716-446655440000"; // Valid UUID for testing
  const { messages, send } = useArchitectChat(sessionId);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Debug helper - add to window for easy browser console access
  React.useEffect(() => {
    (window as any).debugChat = {
      checkHeights: () => {
        const root = document.getElementById('root');
        const layoutRoot = document.querySelector('[data-debug="layout-root"]');
        const layoutMainArea = document.querySelector('[data-debug="layout-main-area"]');
        const layoutMain = document.querySelector('[data-debug="layout-main"]');
        const layoutContent = document.querySelector('[data-debug="layout-content"]');
        const chatContainer = document.querySelector('[data-debug="chat-container"]');
        const chatHeader = document.querySelector('[data-debug="chat-header"]');
        const messagesArea = document.querySelector('[data-debug="messages-area"]');
        const chatInput = document.querySelector('[data-debug="chat-input"]');
        
        console.log('🔍 Height Chain Debug:', {
          windowHeight: window.innerHeight,
          rootHeight: (root as HTMLElement)?.offsetHeight,
          layoutRootHeight: (layoutRoot as HTMLElement)?.offsetHeight,
          layoutMainAreaHeight: (layoutMainArea as HTMLElement)?.offsetHeight,
          layoutMainHeight: (layoutMain as HTMLElement)?.offsetHeight,
          layoutContentHeight: (layoutContent as HTMLElement)?.offsetHeight,
          chatContainerHeight: (chatContainer as HTMLElement)?.offsetHeight,
          chatHeaderHeight: (chatHeader as HTMLElement)?.offsetHeight,
          messagesAreaHeight: (messagesArea as HTMLElement)?.offsetHeight,
          chatInputHeight: (chatInput as HTMLElement)?.offsetHeight,
          messagesScrollHeight: (messagesArea as HTMLElement)?.scrollHeight,
        });
        
        // Check for overflow issues
        const elements = [
          { name: 'Root', el: root },
          { name: 'Layout Root', el: layoutRoot },
          { name: 'Layout Main Area', el: layoutMainArea },
          { name: 'Layout Main', el: layoutMain },
          { name: 'Layout Content', el: layoutContent },
          { name: 'Chat Container', el: chatContainer },
          { name: 'Messages Area', el: messagesArea },
        ];
        
        console.log('🚨 Overflow Check:');
        elements.forEach(({ name, el }) => {
          if (el) {
            const htmlEl = el as HTMLElement;
            const hasHorizontalOverflow = htmlEl.scrollWidth > htmlEl.clientWidth;
            const hasVerticalOverflow = htmlEl.scrollHeight > htmlEl.clientHeight;
            if (hasHorizontalOverflow || hasVerticalOverflow) {
              console.log(`${name} has overflow:`, {
                horizontal: hasHorizontalOverflow ? { scrollWidth: htmlEl.scrollWidth, clientWidth: htmlEl.clientWidth } : false,
                vertical: hasVerticalOverflow ? { scrollHeight: htmlEl.scrollHeight, clientHeight: htmlEl.clientHeight } : false,
              });
            }
          }
        });
      },
      
      checkFlexStyles: () => {
        const flexElements = document.querySelectorAll('[data-debug]');
        console.log('🎨 Flex Styles Debug:');
        flexElements.forEach((el) => {
          const styles = window.getComputedStyle(el);
          const debugName = el.getAttribute('data-debug');
          console.log(`${debugName}:`, {
            display: styles.display,
            flexDirection: styles.flexDirection,
            flexGrow: styles.flexGrow,
            flexShrink: styles.flexShrink,
            flexBasis: styles.flexBasis,
            height: styles.height,
            minHeight: styles.minHeight,
            maxHeight: styles.maxHeight,
            overflow: styles.overflow,
            overflowY: styles.overflowY,
          });
        });
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      setIsStreaming(true);
      try {
        await send(input);
      } finally {
        setIsStreaming(false);
      }
      setInput("");
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-gray-50"
      data-debug="chat-container"
      style={{
        outline: '3px solid red',
        outlineOffset: '-3px',
      }}
    >
      {/* Header */}
      <div 
        className="bg-white border-b px-6 py-4 flex-shrink-0"
        data-debug="chat-header"
        style={{
          outline: '2px solid blue',
          outlineOffset: '-2px',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Architect Assistant</h1>
            <p className="text-sm text-gray-500">System design and architecture guidance</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4"
        data-debug="messages-area"
        style={{
          outline: '2px solid green',
          outlineOffset: '-2px',
        }}
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Start a conversation with the Architect Assistant</p>
            <p className="text-sm text-gray-400 mt-2">Ask about system design, architecture patterns, or technical decisions</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <Loader className="animate-spin h-4 w-4 text-gray-500" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white border-t px-6 py-4 flex-shrink-0"
        data-debug="chat-input"
        style={{
          outline: '2px solid purple',
          outlineOffset: '-2px',
        }}
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about architecture, design patterns, or system design..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}