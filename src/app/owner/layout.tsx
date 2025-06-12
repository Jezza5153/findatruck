// /app/owner/layout.tsx

import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import React from "react";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
