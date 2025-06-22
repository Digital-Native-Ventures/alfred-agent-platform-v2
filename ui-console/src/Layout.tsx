import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}