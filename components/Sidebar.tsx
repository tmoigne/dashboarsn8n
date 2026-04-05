"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", icon: "⬡", label: "Dashboard" },
  { href: "/email-builder", icon: "✉", label: "Email Builder" },
  { href: "/admin/users", icon: "👥", label: "Comptes" },
  { href: "/settings", icon: "⚙", label: "Paramètres" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-14 bg-surface border-r border-border flex flex-col items-center py-4 gap-1 z-40 group hover:w-48 transition-all duration-200 overflow-hidden">
      <div className="w-8 h-8 rounded-lg bg-green-dark flex items-center justify-center mb-4 flex-shrink-0">
        <span className="text-white font-mono font-bold text-sm">N</span>
      </div>

      <nav className="flex flex-col gap-1 w-full px-2">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                active
                  ? "bg-muted border-l-2 border-green text-text"
                  : "border-l-2 border-transparent text-dim hover:text-text hover:bg-muted"
              }`}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
              <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
