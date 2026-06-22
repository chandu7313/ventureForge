"use client";

import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface ShareReportBtnProps {
  reportId: string;
  initialToken?: string | null;
}

export const ShareReportBtn: React.FC<ShareReportBtnProps> = ({ reportId, initialToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [copied, setCopied] = useState(false);

  const shareUrl = token ? `https://startupiq.in/share/${token}` : '';
  const shareText = `I validated my startup idea using startupIQ. Check it out: ${shareUrl}`;

  const handleShare = async () => {
    if (token) return; // Already shared
    setIsLoading(true);
    try {
      const res = await apiClient(`/api/v1/reports/${reportId}/share`, { method: 'POST' });
      setToken(res.token);
    } catch (err) {
      console.error("Failed to generate share link:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await apiClient(`/api/v1/reports/${reportId}/share`, { method: 'DELETE' });
      setToken(null);
    } catch (err) {
      console.error("Failed to disable share link:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button 
        onClick={() => { setIsOpen(true); handleShare(); }}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/30"
      >
        <span className="material-symbols-outlined text-[20px]">share</span>Share
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-6 ambient-shadow relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Share Report</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Generate a public, read-only link to share your startup validation with investors, co-founders, or friends.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
              </div>
            ) : token ? (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Public Link</label>
                  <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/30">
                    <input 
                      type="text" 
                      readOnly 
                      value={shareUrl} 
                      className="flex-1 bg-transparent border-none text-sm text-on-surface px-3 focus:ring-0"
                    />
                    <button 
                      onClick={handleCopy}
                      className="bg-primary text-on-primary px-4 py-2 rounded flex items-center gap-2 text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Share on social</label>
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0077b5]/10 text-[#0077b5] font-bold hover:bg-[#0077b5]/20 transition-colors"
                    >
                      LinkedIn
                    </a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366]/10 text-[#25D366] font-bold hover:bg-[#25D366]/20 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center mt-2">
                  <span className="text-sm text-on-surface-variant">Link is currently active</span>
                  <button 
                    onClick={handleDisable}
                    className="text-error text-sm font-bold hover:underline"
                  >
                    Disable Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <button 
                  onClick={handleShare}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                  Generate Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
