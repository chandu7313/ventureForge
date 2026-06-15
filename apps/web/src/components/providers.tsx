"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </NextThemesProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
