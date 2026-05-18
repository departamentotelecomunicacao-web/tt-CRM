import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export const metadata: Metadata = {
  title: "Fatura CRM — Pipeline visual para times de alta performance",
  description:
    "CRM SaaS premium com gestão Kanban, automações comerciais, omnichannel e IA aplicada à venda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-ink-950">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh opacity-70" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-[0.07]" />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-6 pb-10 pt-4 lg:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
