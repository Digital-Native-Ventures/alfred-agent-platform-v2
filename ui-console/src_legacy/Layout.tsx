import Sidebar from "@/components/Sidebar";
import Topbar  from "@/components/Topbar";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-neutral-50" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Sidebar logoUrl="/lovable-uploads/4f5a01e8-7502-47aa-9bb4-567065f7d751.png" logoFallback="AP" />
        <SidebarInset className="flex flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}