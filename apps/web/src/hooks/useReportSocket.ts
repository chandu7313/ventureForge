import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { SectionStatus } from "@/types/report.types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SectionState {
  status: SectionStatus;
  data: any | null;
  error?: string;
}

export interface ReportSocketState {
  overallStatus: 'DISCONNECTED' | 'CONNECTING' | 'PROCESSING' | 'DONE' | 'FAILED';
  sections: Record<string, SectionState>;
  completedCount: number;
  totalCount: number;
  message: string;
}

export function useReportSocket(reportId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<ReportSocketState>({
    overallStatus: 'DISCONNECTED',
    sections: {},
    completedCount: 0,
    totalCount: 30, // Default to 30 until we get meta
    message: 'Initializing...',
  });

  // Fetch initial completed sections on mount (for instant resume)
  useEffect(() => {
    if (!reportId) return;

    let mounted = true;

    async function fetchInitialState() {
      try {
        const response = await apiClient(`/api/v1/reports/${reportId}/sections`);
        if (mounted && response) {
          const sectionsObj: Record<string, SectionState> = {};
          
          // Populate completed sections
          Object.keys(response.sections || {}).forEach(secId => {
            sectionsObj[secId] = { status: 'completed', data: response.sections[secId] };
          });
          
          // Mark failed sections
          (response.failedSections || []).forEach((secId: string) => {
            if (!sectionsObj[secId]) {
              sectionsObj[secId] = { status: 'failed', data: null, error: 'Failed during generation' };
            }
          });

          setState(prev => ({
            ...prev,
            overallStatus: response.status === 'DONE' ? 'DONE' : response.status === 'FAILED' ? 'FAILED' : 'PROCESSING',
            sections: sectionsObj,
            completedCount: response.completedCount || 0,
            totalCount: response.totalCount || 30,
            message: response.status === 'DONE' ? 'Report complete' : 'Loading progress...',
          }));
        }
      } catch (err) {
        console.error("Failed to fetch initial report sections", err);
      }
    }

    fetchInitialState();

    return () => {
      mounted = false;
    };
  }, [reportId]);

  // Socket connection and events
  useEffect(() => {
    if (!reportId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    setState(prev => ({ ...prev, overallStatus: prev.overallStatus === 'DISCONNECTED' ? 'CONNECTING' : prev.overallStatus }));

    const newSocket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect", () => {
      newSocket.emit("join_report", { reportId });
      setState(prev => prev.overallStatus === 'CONNECTING' ? { ...prev, overallStatus: 'PROCESSING', message: 'Generating report...' } : prev);
    });

    newSocket.on("disconnect", () => {
      setState(prev => ({ ...prev, overallStatus: 'DISCONNECTED' }));
    });

    // ─── Progressive Section Events ───

    newSocket.on("report:section-processing", (data: { sectionId: string }) => {
      setState(prev => ({
        ...prev,
        message: `Generating ${data.sectionId.replace('_', ' ')}...`,
        sections: {
          ...prev.sections,
          [data.sectionId]: { status: 'processing', data: null }
        }
      }));
    });

    newSocket.on("report:section-complete", (data: { sectionId: string, data: any, completedCount: number, totalCount: number }) => {
      setState(prev => ({
        ...prev,
        completedCount: data.completedCount,
        totalCount: data.totalCount,
        sections: {
          ...prev.sections,
          [data.sectionId]: { status: 'completed', data: data.data }
        }
      }));
    });

    newSocket.on("report:section-failed", (data: { sectionId: string, error: string }) => {
      setState(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [data.sectionId]: { status: 'failed', data: null, error: data.error }
        }
      }));
      toast.error(`Failed to generate ${data.sectionId.replace('_', ' ')}`);
    });

    newSocket.on("report:meta", (data: { completedCount: number, totalCount: number, status: string }) => {
      setState(prev => ({
        ...prev,
        completedCount: data.completedCount,
        totalCount: data.totalCount,
      }));
    });

    newSocket.on("report:all-complete", () => {
      setState(prev => ({
        ...prev,
        overallStatus: 'DONE',
        message: 'Report ready',
      }));
      toast.success('Business DNA Report completed!');
    });

    // ─── System Level Events ───

    newSocket.on("report:failed", (data: { error: string }) => {
      setState(prev => ({
        ...prev,
        overallStatus: 'FAILED',
        message: 'Analysis failed'
      }));
      toast.error('Unable to complete request.');
    });

    newSocket.on("report:retry", (data: { service: string, message: string }) => {
      toast.loading(`[${data.service}] Retrying AI request...`, { id: 'ai-retry', duration: 2000 });
      setState(prev => ({ ...prev, message: data.message }));
    });

    newSocket.on("report:fallback", (data: { service: string, message: string }) => {
      toast.warning(`[${data.service}] Switching to backup AI provider...`);
      setState(prev => ({ ...prev, message: data.message }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [reportId]);

  return { socket, ...state };
}
