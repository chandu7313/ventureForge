import * as React from "react";
import { Inter } from "next/font/google";
import { Providers } from "../components/providers";
import "../styles/globals.css"; // Assuming tailwind base is generated here

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "StartupSaarthi AI - Validate Your Startup Idea",
  description: "AI-powered startup validator for Indian founders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
