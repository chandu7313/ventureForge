import * as React from "react";
import { AppSidebar } from "../../components/features/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
        <div className="mx-auto max-w-6xl w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
