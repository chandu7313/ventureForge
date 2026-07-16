import Link from "next/link";
import React from "react";

/**
 * Shared sidebar layout used across all (dashboard) routes.
 * Mirrors the Sovereign Analyst SideNav from the Stitch design system.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
