import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-dvh max-w-[1680px] flex-col gap-4 p-3 lg:p-4 xl:flex-row">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <TopBar />
          <div className="min-h-[calc(100dvh-8rem)] rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)] sm:p-5 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
