import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell() {
  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-[var(--app-bg)] text-[var(--text)]">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto flex min-h-full w-full max-w-[1280px] flex-col px-6 pb-10 pt-2 lg:px-8 xl:px-10">
          <TopBar />
          <div className="mt-7 min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
