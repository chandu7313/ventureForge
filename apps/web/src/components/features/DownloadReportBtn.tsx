"use client";

import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface DownloadReportBtnProps {
  reportId: string;
}

export const DownloadReportBtn: React.FC<DownloadReportBtnProps> = ({ reportId }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const response = await apiClient(`/api/v1/reports/${reportId}/pdf`);
      if (response.url) {
        window.open(response.url, '_blank');
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err: any) {
      console.error("Failed to generate PDF:", err);
      // Show "Upgrade to Pro" logic if we get 403 or 402, else generic error
      if (err?.message?.includes("Upgrade") || err?.status === 402 || err?.status === 403) {
        setError("Pro Plan Required for PDF Download");
      } else {
        setError("Failed to generate PDF.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleDownload}
        disabled={isDownloading}
        className="bg-gradient-to-b from-primary to-primary-container text-on-primary flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium hover:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
      >
        {isDownloading ? (
          <>
            <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
            Generating...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">download</span>
            Download PDF
          </>
        )}
      </button>
      {error && (
        <div className="absolute top-full mt-2 right-0 w-max max-w-xs bg-error text-on-error text-xs font-bold px-3 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};
