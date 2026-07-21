import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface ReportData {
  [key: string]: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ReportGateway {
  private readonly logger = new Logger(ReportGateway.name);

  @WebSocketServer()
  server: Server;

  // Expected payload: { reportId: string }
  @SubscribeMessage('join_report')
  handleJoinReport(@ConnectedSocket() client: Socket, @MessageBody() data: { reportId: string }): void {
    if (!data?.reportId) return;
    
    // NOTE: Auth token validation can be extracted from client.handshake.auth.token
    // In production, verify the user owns the reportId before joining.
    const token = client.handshake.auth?.token;
    if (token) {
      // Validate JWT here...
    }

    client.join(`report:${data.reportId}`);
    this.logger.debug(`Client ${client.id} joined room report:${data.reportId}`);
  }

  // ─── Legacy Events (backward compatibility) ────────────────────

  emitQueued(reportId: string, position: number, estimatedWait: string) {
    this.server.to(`report:${reportId}`).emit('report:queued', { reportId, position, estimatedWait });
  }

  emitStarted(reportId: string, startedAt: string) {
    this.server.to(`report:${reportId}`).emit('report:started', { reportId, startedAt });
  }

  emitProgress(reportId: string, stage: string, percent: number, data?: { message: string, data?: any }) {
    this.server.to(`report:${reportId}`).emit('report:progress', {
      reportId,
      stage,
      percent,
      message: data?.message || '',
    });
  }

  emitCompleted(reportId: string, report: ReportData) {
    this.server.to(`report:${reportId}`).emit('report:completed', { reportId, report });
  }

  emitFailed(reportId: string, error: string) {
    this.server.to(`report:${reportId}`).emit('report:failed', { reportId, error });
  }

  // ─── Progressive Section Events ────────────────────────────────

  /** Emitted when a section starts generating */
  emitSectionProcessing(reportId: string, sectionId: string) {
    this.server.to(`report:${reportId}`).emit('report:section-processing', {
      reportId,
      sectionId,
      timestamp: new Date().toISOString(),
    });
  }

  /** Emitted when a single section completes — carries the section data */
  emitSectionComplete(reportId: string, sectionId: string, data: any, meta?: { completedCount: number; totalCount: number }) {
    this.server.to(`report:${reportId}`).emit('report:section-complete', {
      reportId,
      sectionId,
      data,
      completedCount: meta?.completedCount ?? 0,
      totalCount: meta?.totalCount ?? 30,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`📦 [${reportId}] Section "${sectionId}" delivered to client`);
  }

  /** Emitted when a section fails */
  emitSectionFailed(reportId: string, sectionId: string, error: string) {
    this.server.to(`report:${reportId}`).emit('report:section-failed', {
      reportId,
      sectionId,
      error,
      timestamp: new Date().toISOString(),
    });
    this.logger.warn(`❌ [${reportId}] Section "${sectionId}" failed: ${error}`);
  }

  /** Emitted periodically with overall progress metadata */
  emitReportMeta(reportId: string, completedCount: number, totalCount: number, status: string) {
    this.server.to(`report:${reportId}`).emit('report:meta', {
      reportId,
      completedCount,
      totalCount,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /** Emitted when ALL sections are done (report fully complete) */
  emitReportFullyComplete(reportId: string) {
    this.server.to(`report:${reportId}`).emit('report:all-complete', {
      reportId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`✅ [${reportId}] All sections complete — report ready`);
  }
}
