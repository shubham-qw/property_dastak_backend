import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { Pool } from 'pg';
import { WebSocketServer, WebSocket } from 'ws';
import nodeDB from './Database/dbConn/nodeDB';
import { ChatGateway } from './Chat/Providers/chat.gateway';

type IncomingMsg = {
  propertyId?: string;
  userId?: string;
  [k: string]: any;
};

type Session = {
  propertyId: string | null;
  userId: string | null;
  startTime: Date;
};

const WS_PORT = Number(process.env.WS_PORT ?? 4000);

// PostgreSQL pool (shared with Nest services via nodeDB)
const pool: Pool = nodeDB.getPool();

pool.on('error', (err) => {
  console.error('Unexpected PG error:', err);
  process.exit(1);
});

/**
 * Legacy property-view tracking WebSocket (separate port).
 * Chat lives on the Nest HTTP port at /ws/chat.
 */
const wss = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`🚀 Property-view WebSocket running on ws://localhost:${WS_PORT}`);
});

wss.on('connection', (ws: WebSocket) => {
  console.log('⚡ Property-view client connected');

  const session: Session = {
    propertyId: null,
    userId: null,
    startTime: new Date(),
  };

  ws.on('message', (raw) => {
    let str: string;
    if (typeof raw === 'string') str = raw;
    else if (raw instanceof Buffer) str = raw.toString('utf8');
    else str = String(raw);

    try {
      const data: IncomingMsg = JSON.parse(str);

      if (data.propertyId && typeof data.propertyId === 'string') {
        session.propertyId = data.propertyId;
      }
      if (data.userId && typeof data.userId === 'string') {
        session.userId = data.userId;
      }
    } catch (err) {
      console.warn('❌ Failed to parse message:', err);
      try {
        ws.send(JSON.stringify({ error: 'invalid_json' }));
      } catch {
        /* ignore */
      }
    }
  });

  ws.on('close', async () => {
    const endTime = new Date();
    const timeSeconds = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 1000,
    );

    if (!session.propertyId) {
      console.warn(
        '⚠️ Connection closed but propertyId not provided — skipping DB insert',
      );
      return;
    }

    try {
      const insertQuery = `
        INSERT INTO properties_seen_time
          (property_id, user_id, time_seconds, start_time, end_time)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(insertQuery, [
        session.propertyId,
        session.userId,
        timeSeconds,
        session.startTime,
        endTime,
      ]);
      console.log(
        `✅ Stored: propertyId=${session.propertyId}, userId=${session.userId}, time=${timeSeconds}s`,
      );
    } catch (err) {
      console.error('❌ DB insert failed:', err);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

async function shutdown() {
  console.log('⚠️ Shutting down server...');
  try {
    wss.close(() => console.log('Property-view WebSocket closed'));
    await pool.end();
    console.log('Postgres pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  // Attach chat WS to the same Nest HTTP server/port
  const httpServer = app.getHttpServer();
  const chatGateway = app.get(ChatGateway);
  chatGateway.attach(httpServer);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Chat WebSocket: ws://localhost:${port}/ws/chat?token=<JWT>`);
}
bootstrap();
