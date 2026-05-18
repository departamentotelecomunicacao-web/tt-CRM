import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-[0.05]" />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-6 pb-12 pt-4 lg:px-8">{children}</main>
        </div>
      </div>
    </>
  );
}
