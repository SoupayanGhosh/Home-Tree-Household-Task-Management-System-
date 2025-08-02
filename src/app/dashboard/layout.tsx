import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div
        className="flex min-h-screen w-full bg-background"
        style={{
          // Custom CSS variables for sidebar and header
          // @ts-ignore
          "--sidebar-width": "calc(var(--spacing) * 72)",
          // @ts-ignore
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </SidebarProvider>
  );
} 