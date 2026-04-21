import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-4 p-4">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <TopBar />
          <div className="min-h-[calc(100vh-3rem)] border border-[var(--border)] bg-[var(--panel)] p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
