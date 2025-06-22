import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Folder, MessageSquare } from "lucide-react";

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
      className={`h-full bg-slate-900 text-white transition-all ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      <button
        className="p-2 w-full text-left hover:bg-slate-800"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "»" : "«"} Menu
      </button>
      <nav className="mt-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-2 hover:bg-slate-800 ${
              pathname.startsWith(to) ? "bg-slate-800" : ""
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}