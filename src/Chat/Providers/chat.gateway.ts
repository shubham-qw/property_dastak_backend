import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { IncomingMessage } from 'http';
import type { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { JwtService } from '../../User/Providers/jwt.service';
import { ChatService } from './chat.service';
import { ClientWsEvent, ServerWsEvent } from '../dto/chat.dto';

type AuthedSocket = WebSocket & {
  userId?: number;
  userUuid?: string;
  isAlive?: boolean;
  joinedConversations?: Set<number>;
};

@Injectable()
export class ChatGateway implements OnModuleDestroy {
  private readonly logger = new Logger(ChatGateway.name);
  private wss: WebSocketServer | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  /** userId -> open sockets (supports multi-device) */
  private readonly socketsByUser = new Map<number, Set<AuthedSocket>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Attach chat WebSocket to the existing Nest HTTP server (same host/port).
   * Clients connect to: ws://<host>:<port>/ws/chat?token=<JWT>
   */
  attach(httpServer: HttpServer) {
    if (this.wss) {
      return;
    }

    this.wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (req, socket, head) => {
      try {
        const host = req.headers.host || 'localhost';
        const url = new URL(req.url || '/', `http://${host}`);
        if (url.pathname !== '/ws/chat') {
          return;
        }

        this.wss!.handleUpgrade(req, socket, head, (ws) => {
          this.wss!.emit('connection', ws, req);
        });
      } catch (err) {
        this.logger.error('Upgrade error', err as Error);
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws: AuthedSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req).catch((err) => {
        this.logger.error('Connection handling failed', err as Error);
        this.send(ws, {
          type: 'error',
          code: 'auth_failed',
          message: 'Authentication failed',
        });
        ws.close(1008, 'Unauthorized');
      });
    });

    // Detect dead connections so presence stays accurate after network drops
    this.heartbeatTimer = setInterval(() => {
      if (!this.wss) return;
      for (const client of this.wss.clients) {
        const sock = client as AuthedSocket;
        if (sock.isAlive === false) {
          sock.terminate();
          continue;
        }
        sock.isAlive = false;
        try {
          sock.ping();
        } catch {
          /* ignore */
        }
      }
    }, 30000);

    this.logger.log('Chat WebSocket attached at /ws/chat (same Nest port)');
  }

  private async handleConnection(ws: AuthedSocket, req: IncomingMessage) {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `http://${host}`);
    const token =
      url.searchParams.get('token') ||
      this.extractBearer(req.headers.authorization);

    if (!token) {
      this.send(ws, {
        type: 'error',
        code: 'missing_token',
        message: 'JWT token required as ?token= or Authorization header',
      });
      ws.close(1008, 'Unauthorized');
      return;
    }

    let payload: { sub: number; user_uuid: string };
    try {
      payload = this.jwtService.verifyToken(token);
    } catch {
      this.send(ws, {
        type: 'error',
        code: 'invalid_token',
        message: 'Invalid or expired JWT',
      });
      ws.close(1008, 'Unauthorized');
      return;
    }

    const userId = Number(payload.sub);
    const userUuid = payload.user_uuid;
    if (!userId || !userUuid || userUuid === 'otp_signup') {
      this.send(ws, {
        type: 'error',
        code: 'invalid_token',
        message: 'A completed user login token is required for chat',
      });
      ws.close(1008, 'Unauthorized');
      return;
    }

    const wasOffline = !this.chatService.isUserOnline(userId);

    ws.userId = userId;
    ws.userUuid = userUuid;
    ws.isAlive = true;
    ws.joinedConversations = new Set();

    if (!this.socketsByUser.has(userId)) {
      this.socketsByUser.set(userId, new Set());
    }
    this.socketsByUser.get(userId)!.add(ws);
    this.chatService.setUserOnline(userId);

    // reconnect=true when user was offline and is connecting again
    // (client should refetch conversations/messages after reconnect)
    this.send(ws, {
      type: 'connected',
      user_id: userId,
      user_uuid: userUuid,
      reconnect: wasOffline,
    });

    if (wasOffline) {
      this.broadcastPresence(userUuid, 'online', userId);
    }

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (raw) => {
      this.handleMessage(ws, raw).catch((err) => {
        this.logger.warn(`WS message error: ${(err as Error).message}`);
        this.send(ws, {
          type: 'error',
          code: 'message_failed',
          message: (err as Error).message || 'Failed to process message',
        });
      });
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    ws.on('error', (err) => {
      this.logger.warn(`WS error for user ${userId}: ${err.message}`);
    });
  }

  private extractBearer(header?: string): string | null {
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
    return token;
  }

  private async handleMessage(ws: AuthedSocket, raw: Buffer | ArrayBuffer | Buffer[] | string) {
    const str =
      typeof raw === 'string'
        ? raw
        : Buffer.isBuffer(raw)
          ? raw.toString('utf8')
          : String(raw);

    let event: ClientWsEvent;
    try {
      event = JSON.parse(str);
    } catch {
      this.send(ws, {
        type: 'error',
        code: 'invalid_json',
        message: 'Payload must be valid JSON',
      });
      return;
    }

    if (!event?.type) {
      this.send(ws, {
        type: 'error',
        code: 'invalid_event',
        message: 'Missing event type',
      });
      return;
    }

    const userId = ws.userId!;
    const userUuid = ws.userUuid!;

    switch (event.type) {
      case 'ping': {
        this.send(ws, { type: 'pong', ts: Date.now() });
        break;
      }

      case 'join': {
        await this.chatService.assertParticipant(event.conversation_id, userId);
        ws.joinedConversations!.add(event.conversation_id);
        break;
      }

      case 'leave': {
        ws.joinedConversations!.delete(event.conversation_id);
        break;
      }

      case 'send_message': {
        const { message, participantIds } = await this.chatService.sendMessage(
          userId,
          {
            conversationId: event.conversation_id,
            toUserUuid: event.to_user_uuid,
            content: event.content,
          },
        );

        const payload: ServerWsEvent = { type: 'message', message };
        for (const pid of participantIds) {
          this.sendToUser(pid, payload);
        }

        // Push conversation list refresh for recipients
        for (const pid of participantIds) {
          try {
            const conversation = await this.chatService.getConversationForUser(
              message.conversation_id,
              pid,
            );
            this.sendToUser(pid, {
              type: 'conversation_updated',
              conversation,
            });
          } catch {
            /* ignore */
          }
        }
        break;
      }

      case 'typing': {
        await this.chatService.assertParticipant(event.conversation_id, userId);
        const participants = await this.chatService.getParticipantIds(
          event.conversation_id,
        );
        const typingEvent: ServerWsEvent = {
          type: 'typing',
          conversation_id: event.conversation_id,
          user_id: userId,
          user_uuid: userUuid,
          is_typing: !!event.is_typing,
        };
        for (const pid of participants) {
          if (pid !== userId) {
            this.sendToUser(pid, typingEvent);
          }
        }
        break;
      }

      case 'mark_read': {
        await this.chatService.markConversationRead(event.conversation_id, userId);
        break;
      }

      case 'get_presence': {
        const users = await this.chatService.getPresenceByUuids(
          event.user_uuids || [],
        );
        this.send(ws, { type: 'presence_list', users });
        break;
      }

      default: {
        this.send(ws, {
          type: 'error',
          code: 'unknown_event',
          message: `Unknown event type`,
        });
      }
    }
  }

  private handleDisconnect(ws: AuthedSocket) {
    const userId = ws.userId;
    const userUuid = ws.userUuid;
    if (!userId || !userUuid) return;

    const set = this.socketsByUser.get(userId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) {
        this.socketsByUser.delete(userId);
        this.chatService.setUserOffline(userId);
        this.broadcastPresence(userUuid, 'offline', userId);
      }
    }
  }

  private broadcastPresence(
    userUuid: string,
    status: 'online' | 'offline',
    excludeUserId?: number,
  ) {
    const event: ServerWsEvent = { type: 'presence', user_uuid: userUuid, status };
    for (const [uid, sockets] of this.socketsByUser.entries()) {
      if (excludeUserId != null && uid === excludeUserId) continue;
      for (const sock of sockets) {
        this.send(sock, event);
      }
    }
  }

  sendToUser(userId: number, event: ServerWsEvent) {
    const sockets = this.socketsByUser.get(userId);
    if (!sockets) return;
    for (const sock of sockets) {
      this.send(sock, event);
    }
  }

  private send(ws: WebSocket, event: ServerWsEvent) {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify(event));
    } catch (err) {
      this.logger.warn(`Failed to send WS event: ${(err as Error).message}`);
    }
  }

  onModuleDestroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.wss) {
      for (const client of this.wss.clients) {
        client.close(1001, 'Server shutting down');
      }
      this.wss.close();
      this.wss = null;
    }
  }
}
