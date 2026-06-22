"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Zap } from "lucide-react";

export const BillingStatus = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const meRes = await apiClient('/api/v1/users/me');
        setData({
          credits: meRes.credits
        });
      } catch (err) {
        console.error("Failed to fetch billing status", err);
      }
    };
    fetchStatus();
  }, []);

  if (!data || isCollapsed) return null;

  const { credits } = data;

  return (
    <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-3 text-white text-xs shadow-md">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5 font-semibold text-sm">
          <Zap size={14} className="text-yellow-300 fill-yellow-300" />
          <span>{credits?.toLocaleString() || 0} Credits</span>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <p className="opacity-80 text-[10px]">100 / report</p>
        <Link href="/billing" className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-[10px] font-medium transition-colors">
          Top Up
        </Link>
      </div>
    </div>
  );
};
