import { Bell, Search, Settings, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects, agents, or commands..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Service Status */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
          {[
            { name: "API", status: "healthy" },
            { name: "n8n", status: "healthy" },
            { name: "Slack", status: "healthy" }
          ].map(({ name, status }) => (
            <div key={name} className="flex items-center gap-2" title={`${name} ${status}`}>
              <div className={`w-2 h-2 rounded-full ${
                status === "healthy" ? "bg-green-500" : "bg-red-500"
              } animate-pulse`} />
              <span className="text-sm font-medium text-gray-700">{name}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} className="text-gray-600" />
          </button>
          <button className="ml-2 flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}