import { Sidebar } from "@/components/layouts/Sidebar";
import { TopNav } from "@/components/layouts/TopNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1">
        <TopNav />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
