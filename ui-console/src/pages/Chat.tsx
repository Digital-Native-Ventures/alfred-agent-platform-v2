import { Send, Bot, User, Paperclip, Mic } from "lucide-react";
import { useState } from "react";

export default function Chat() {
  const [message, setMessage] = useState("");
  
  const conversations = [
    { id: 1, agent: "Data Assistant", lastMessage: "Analysis complete. Found 3 insights...", time: "2m ago", unread: 2 },
    { id: 2, agent: "Code Helper", lastMessage: "The function has been optimized", time: "1h ago", unread: 0 },
    { id: 3, agent: "Research Bot", lastMessage: "Here are the market trends...", time: "3h ago", unread: 0 },
  ];

  const messages = [
    { id: 1, sender: "bot", content: "Hello! I'm your AI assistant. How can I help you today?", time: "10:00 AM" },
    { id: 2, sender: "user", content: "Can you analyze the sales data from last quarter?", time: "10:02 AM" },
    { id: 3, sender: "bot", content: "I'll analyze the Q4 sales data for you. Let me process the information...", time: "10:02 AM" },
    { id: 4, sender: "bot", content: "Analysis complete! Here are the key findings:\n\n1. Total revenue increased by 23% compared to Q3\n2. Top performing product category: Electronics (+45%)\n3. Customer retention rate improved to 87%\n\nWould you like me to create a detailed report?", time: "10:03 AM" },
  ];

  return (
    <div className="flex h-full -m-6">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{conv.agent}</h3>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{conv.time}</p>
                  {conv.unread > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full mt-1">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Assistant</h3>
              <p className="text-sm text-green-600">Active now</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start gap-3 max-w-2xl ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === "user" 
                    ? "bg-gray-200" 
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                }`}>
                  {msg.sender === "user" ? (
                    <User size={16} className="text-gray-600" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-white border border-gray-200"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip size={20} className="text-gray-500" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Handle send
                  setMessage("");
                }
              }}
            />
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Mic size={20} className="text-gray-500" />
            </button>
            <button className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}