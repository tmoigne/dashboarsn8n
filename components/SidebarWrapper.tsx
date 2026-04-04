"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebar = pathname === "/login";

  if (noSidebar) return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className="pl-14">{children}</div>
    </>
  );
}
