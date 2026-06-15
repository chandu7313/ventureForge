import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ReportGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribeToReport')
  handleSubscribe(client: Socket, reportId: string): void {
    client.join(`report:${reportId}`);
  }

  emitProgress(reportId: string, stage: string, progress: number, data?: any) {
    this.server.to(`report:${reportId}`).emit('report:progress', {
      stage,
      progress,
      data,
    });
  }
}
