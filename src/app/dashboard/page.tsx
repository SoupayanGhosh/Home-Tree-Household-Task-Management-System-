"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import Dashboard from "@/components/pages/dashboard";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const interval = setTimeout(() => {
      router.refresh(); // Refresh the page
    }, 2 * 60 * 1000); // 2 minutes in milliseconds

    return () => clearTimeout(interval); // Clean up on component unmount
  }, [router]);

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col p-4 md:p-8 bg-card rounded-lg shadow-sm mt-4">
        <Dashboard />
      </div>
    </SidebarInset>
  )
}