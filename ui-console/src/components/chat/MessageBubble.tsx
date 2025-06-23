
interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  // Force show content length for debugging
  const debugInfo = `[${role}: ${content.length} chars]`;
  
  if (role === "user") {
    // User messages - simple styling, no markdown
    return (
      <div className="max-w-2xl rounded-lg px-4 py-2 bg-blue-600 text-white ml-auto" style={{ color: '#ffffff', backgroundColor: '#2563eb' }}>
        <p className="whitespace-pre-wrap">{content}</p>
        <small style={{ opacity: 0.7 }}>{debugInfo}</small>
      </div>
    );
  }

  // Assistant messages - simplified without markdown for debugging
  return (
    <div className="max-w-2xl rounded-lg px-4 py-2 bg-white border border-gray-200 text-gray-900" style={{ color: '#111827', backgroundColor: '#ffffff' }}>
      <p className="whitespace-pre-wrap" style={{ color: '#111827' }}>{content || "(empty)"}</p>
      <small style={{ opacity: 0.5, color: '#666' }}>{debugInfo}</small>
    </div>
  );
}