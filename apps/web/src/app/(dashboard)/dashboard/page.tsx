import * as React from "react";
import { Suspense } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@startupsaarthi/ui";

// Mock data fetcher
async function getDashboardStats() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    totalReports: 12,
    avgScore: 74,
    validationsLeft: 3,
  };
}

async function StatsDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      <StatCard label="Total Reports Generated" value={stats.totalReports} delta={15} />
      <StatCard label="Average Market Score" value={stats.avgScore} />
      <StatCard label="Validations Remaining" value={stats.validationsLeft} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your startup idea validations.</p>
        </div>
        <Link 
          href="/validate/new" 
          className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          New Validation
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }>
        <StatsDashboard />
      </Suspense>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <PlusCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No reports yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            You haven't validated any ideas yet. Start your first validation to see your reports here.
          </p>
          <Link 
            href="/validate/new" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create your first report &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
