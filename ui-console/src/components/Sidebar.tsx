import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Folder, MessageSquare, Menu, X, Bot, Cpu } from "lucide-react";

const links = [
  { to: "/overview", label: "Overview", icon: Home },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/chat", label: "Chat", icon: MessageSquare },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className={`flex items-center gap-3 transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg">Alfred</span>
        </div>
        <button
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-3">
        <div className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                    : "hover:bg-slate-800 text-slate-300 hover:text-white"
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon 
                  size={20} 
                  className={`transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} 
                />
                <span className={`font-medium transition-opacity ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
                  {label}
                </span>
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 ${collapsed ? "hidden" : ""}`}>
        <div className="text-xs text-slate-400 space-y-1">
          <p>Agent Platform v2.0</p>
          <p className="opacity-60">© 2025 Alfred AI</p>
        </div>
      </div>
    </aside>
  );
}