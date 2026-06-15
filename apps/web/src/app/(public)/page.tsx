import * as React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Target } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ScoreGauge } from "@startupsaarthi/ui";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-indigo-600" />
          <span className="font-bold text-xl tracking-tight text-foreground">StartupSaarthi</span>
        </div>
        <nav className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium hover:text-indigo-600 transition-colors">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Go to Dashboard &rarr;
            </Link>
          </SignedIn>
        </nav>
      </header>

      <main className="flex-1 pt-32 pb-16 px-6 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-32">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance">
            Validate your startup idea <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">in 60 seconds.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Stop guessing. Our multi-agent AI analyzes your market, competitors, and MVP tech stack to give you a detailed viability report before you write a single line of code.
          </p>
          <div className="pt-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-indigo-700 gap-2">
                  Get Started for Free <ArrowRight className="h-4 w-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-indigo-700 gap-2">
                Launch Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* Feature Highlights - Client Island demo context */}
        <section className="grid md:grid-cols-3 gap-8 mb-32">
          <div className="rounded-2xl p-8 bg-slate-50 dark:bg-slate-900 border text-center flex flex-col items-center">
            <Target className="h-10 w-10 text-indigo-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Market Scoring</h3>
            <p className="text-muted-foreground text-sm">We process thousands of data points to assign an accurate market score.</p>
            <div className="mt-6">
              <ScoreGauge score={85} size={100} />
            </div>
          </div>
          <div className="rounded-2xl p-8 bg-slate-50 dark:bg-slate-900 border text-center flex flex-col items-center">
            <Shield className="h-10 w-10 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Risk Mitigation</h3>
            <p className="text-muted-foreground text-sm">Identify critical risks and actionable mitigation strategies instantly.</p>
          </div>
          <div className="rounded-2xl p-8 bg-slate-50 dark:bg-slate-900 border text-center flex flex-col items-center">
            <Zap className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">MVP Generation</h3>
            <p className="text-muted-foreground text-sm">Get a complete 4-phase MVP timeline and precise tech stack recommendations.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
