"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }
    setLoading(true);

    try {
      const data = await apiClient("/auth/register", {
        method: "POST",
        data: { name, email, password },
      });
      document.cookie = `token=${data.token}; path=/; max-age=604800`; // 7 days
      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-gray-100 pb-[1px] mb-12">
        <Link href="/sign-in" className="text-sm font-medium text-gray-400 hover:text-gray-900 pb-3 transition-colors">
          Log In
        </Link>
        <div className="text-sm font-bold text-gray-900 pb-3 border-b-2 border-[#22c55e]">
          Sign Up
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Create your analyst account</h1>
        <p className="text-[15px] text-gray-600">
          Start your institutional-grade validation journey today.
        </p>
      </div>

      {/* Google Button */}
      <button
        type="button"
        className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors mb-8"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">OR</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-[15px] text-gray-900 placeholder:text-gray-300 focus:border-gray-900 focus:ring-0"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="rahul@venture-fund.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-[15px] text-gray-900 placeholder:text-gray-300 focus:border-gray-900 focus:ring-0"
            required
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
          />
        </div>



        <div className="space-y-1 relative">
          <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-[15px] text-gray-900 placeholder:text-gray-300 focus:border-gray-900 focus:ring-0"
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-3 pt-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 leading-snug">
            I agree to the <a href="#" className="font-semibold text-gray-900 hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-gray-900 hover:underline">Privacy Policy</a> regarding institutional data usage.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center space-x-2 rounded-md bg-[#111827] px-4 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <span>{loading ? "Creating..." : "Create Account"}</span>
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[#22c55e] hover:text-green-600 transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}
