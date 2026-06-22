import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiClient } from "@/lib/api-client"; // Use this to get token if needed, or assume cookie for now

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SocketState {
  status: 'DISCONNECTED' | 'CONNECTING' | 'QUEUED' | 'PROCESSING' | 'DONE' | 'FAILED';
  percent: number;
  stage: string;
  message: string;
  report: any | null;
  error: string | null;
  position?: number;
  estimatedWait?: string;
}

export function useReportSocket(reportId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    status: 'DISCONNECTED',
    percent: 0,
    stage: 'initializing',
    message: 'Connecting to server...',
    report: null,
    error: null,
  });

  useEffect(() => {
    if (!reportId) return;

    // Ideally, extract the token from cookies or localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    setState(prev => ({ ...prev, status: 'CONNECTING' }));

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      newSocket.emit("join_report", { reportId });
      // If we don't have a specific status yet, we're waiting for the worker
      setState(prev => prev.status === 'CONNECTING' ? { ...prev, status: 'QUEUED', message: 'Waiting in queue...' } : prev);
    });

    newSocket.on("disconnect", () => {
      setState(prev => ({ ...prev, status: 'DISCONNECTED' }));
    });

    newSocket.on("report:queued", (data: { position: number, estimatedWait: string }) => {
      setState(prev => ({
        ...prev,
        status: 'QUEUED',
        position: data.position,
        estimatedWait: data.estimatedWait,
        message: `Queued (Position: ${data.position})`
      }));
    });

    newSocket.on("report:started", () => {
      setState(prev => ({
        ...prev,
        status: 'PROCESSING',
        percent: 0,
        message: 'Starting analysis...'
      }));
    });

    newSocket.on("report:progress", (data: { stage: string, percent: number, message: string }) => {
      setState(prev => ({
        ...prev,
        status: 'PROCESSING',
        stage: data.stage,
        percent: data.percent,
        message: data.message
      }));
    });

    newSocket.on("report:completed", (data: { report: any }) => {
      setState(prev => ({
        ...prev,
        status: 'DONE',
        percent: 100,
        stage: 'completed',
        message: 'Report ready',
        report: data.report
      }));
    });

    newSocket.on("report:failed", (data: { error: string }) => {
      setState(prev => ({
        ...prev,
        status: 'FAILED',
        error: data.error,
        message: 'Analysis failed'
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [reportId]);

  return { socket, ...state };
}
