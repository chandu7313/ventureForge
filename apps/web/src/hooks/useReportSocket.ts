import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ReportProgress {
  stage: string;
  progress: number;
  data?: any;
}

export function useReportSocket(reportId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<ReportProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!reportId) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("subscribeToReport", reportId);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("report:progress", (data: ReportProgress) => {
      setProgress(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [reportId]);

  return { isConnected, progress, socket };
}
