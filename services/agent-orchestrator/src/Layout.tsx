import Sidebar from "@/components/layout/Sidebar";
import Topbar  from "@/components/layout/Topbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen font-display bg-neutral-50">
      <Sidebar />
      <main className="flex flex-col flex-1">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}