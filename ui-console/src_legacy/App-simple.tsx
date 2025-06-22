export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <h1 className="text-4xl font-bold text-brand-700 mb-4">
        Alfred Platform Console
      </h1>
      <p className="text-gray-600 mb-8">
        React is working! Phase-9 UI is loading properly.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-brand-700">Dashboard</h3>
          <p className="text-sm text-gray-600">System overview</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-brand-700">Agents</h3>
          <p className="text-sm text-gray-600">AI agent management</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-brand-700">Chat</h3>
          <p className="text-sm text-gray-600">Architect chat interface</p>
        </div>
      </div>
    </div>
  );
}