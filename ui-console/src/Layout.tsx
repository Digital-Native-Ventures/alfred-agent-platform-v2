import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function Layout() {
  const location = useLocation();
  const isChat = location.pathname === "/chat";
  
  return (
    <div 
      className="flex h-screen overflow-hidden"
      data-debug="layout-root"
      style={{
        outline: '4px solid orange',
        outlineOffset: '-4px',
      }}
    >
      <Sidebar />
      <div 
        className="flex-1 flex flex-col"
        data-debug="layout-main-area"
        style={{
          outline: '3px solid cyan',
          outlineOffset: '-3px',
        }}
      >
        <Topbar />
        <main 
          className={`flex-1 ${isChat ? 'overflow-hidden' : 'overflow-auto'} bg-gray-50`}
          data-debug="layout-main"
          style={{
            outline: '3px solid magenta',
            outlineOffset: '-3px',
          }}
        >
          <div 
            className={`${isChat ? 'h-full' : 'max-w-7xl mx-auto p-6'}`}
            data-debug="layout-content"
            style={{
              outline: '2px solid yellow',
              outlineOffset: '-2px',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}