import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EventBusProvider } from "@/components/providers/EventBus";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Fatura CRM — Pipeline visual enterprise",
  description:
    "CRM SaaS premium com Kanban operacional, automações, omnichannel e IA aplicada à venda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <EventBusProvider>
              <ToastProvider>{children}</ToastProvider>
            </EventBusProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
