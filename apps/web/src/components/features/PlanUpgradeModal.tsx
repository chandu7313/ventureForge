"use client";

import React, { useState, useEffect } from "react";
import { Check, X as XIcon, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  message?: string;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({ isOpen, onClose, onSuccess, message }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRedirect = () => {
    onClose();
    router.push('/billing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative border">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground transition-colors"
        >
          <XIcon size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="fill-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Out of Credits</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {message || "You don't have enough credits to generate this report."}
          </p>
        </div>

        <div className="border-2 border-indigo-500 rounded-xl p-5 bg-indigo-50 dark:bg-indigo-900/10 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400">Starter Pack</h3>
            <span className="text-xl font-bold">₹499</span>
          </div>
          
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2 items-center"><Check size={16} className="text-indigo-600" /> 500 Credits (5 Reports)</li>
            <li className="flex gap-2 items-center"><Check size={16} className="text-indigo-600" /> Never expires</li>
            <li className="flex gap-2 items-center"><Check size={16} className="text-indigo-600" /> PDF Exports & Comparison</li>
          </ul>
        </div>

        <button 
          onClick={handleRedirect} 
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Top Up Credits
        </button>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          View more packages on the billing page.
        </p>
      </div>
    </div>
  );
};
