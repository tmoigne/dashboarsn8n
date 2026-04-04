import type { Metadata } from "next";
import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";

export const metadata: Metadata = {
  title: "N8N Dashboard — Occitinfo",
  description: "Interface d'automatisation connectée à n8n",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-bg text-text">
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  );
}
