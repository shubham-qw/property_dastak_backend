import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

import { WebSocketServer, WebSocket } from "ws";
import { Pool } from "pg";

type IncomingMsg = {
  propertyId?: string;
  userId?: string;
  // allow other small keys if needed
  [k: string]: any;
};

type Session = {
  propertyId: string | null;
  userId: string | null;
  startTime: Date;
};

const PG_USER = process.env.PG_USER ?? "admin";
const PG_HOST = process.env.PG_HOST ?? "localhost";
const PG_DB = process.env.PG_DB ?? "property_dastak";
const PG_PASSWORD = process.env.PG_PASSWORD ?? "Admin@123";
const PG_PORT = Number(process.env.PG_PORT ?? 5432);
const WS_PORT = Number(process.env.WS_PORT ?? 4000);

// PostgreSQL pool
const pool = new Pool({
  user: PG_USER,
  host: PG_HOST,
  database: PG_DB,
  password: PG_PASSWORD,
  port: PG_PORT,
});

pool.on("error", (err) => {
  console.error("Unexpected PG error:", err);
  process.exit(1);
});

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`🚀 WebSocket server running on ws://localhost:${WS_PORT}`);
});

wss.on("connection", (ws: WebSocket) => {
  console.log("⚡ Client connected");

  const session: Session = {
    propertyId: null,
    userId: null,
    startTime: new Date(),
  };

  ws.on("message", (raw) => {
    // message may be Buffer, string, ArrayBuffer; normalize to string
    let str: string;
    if (typeof raw === "string") str = raw;
    else if (raw instanceof Buffer) str = raw.toString("utf8");
    else str = String(raw);

    try {
      const data: IncomingMsg = JSON.parse(str);

      // basic validation
      if (data.propertyId && typeof data.propertyId === "string") {
        session.propertyId = data.propertyId;
      }
      if (data.userId && typeof data.userId === "string") {
        session.userId = data.userId;
      }

      // optionally respond to client
      // ws.send(JSON.stringify({ ok: true }));
    } catch (err) {
      console.warn("❌ Failed to parse message:", err);
      // optionally notify client about malformed payload
      try {
        ws.send(JSON.stringify({ error: "invalid_json" }));
      } catch {
        /* ignore send errors */
      }
    }
  });

  ws.on("close", async (code, reason) => {
    const endTime = new Date();
    const timeSeconds = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000);

    if (!session.propertyId) {
      console.warn("⚠️ Connection closed but propertyId not provided — skipping DB insert");
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
      console.log(`✅ Stored: propertyId=${session.propertyId}, userId=${session.userId}, time=${timeSeconds}s`);
    } catch (err) {
      console.error("❌ DB insert failed:", err);
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

// Graceful shutdown
async function shutdown() {
  console.log("⚠️ Shutting down server...");
  try {
    wss.close(() => console.log("WebSocket server closed"));
    await pool.end();
    console.log("Postgres pool closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  // Serve uploads statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  
  await app.listen(process.env.PORT ?? 8080);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
