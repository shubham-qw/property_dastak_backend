// server.js
const { WebSocketServer } = require('ws');
const { Pool } = require("pg");

// ✅ Configure Postgres connection
const pool = new Pool({
  user: "admin",       // change if needed
  host: "localhost",
  database: "property_dastak",       // your db name
  password: "Admin@123",   // your db password
  port: 5432,
});

// ✅ Create WebSocket server
const wss = new WebSocketServer({ port: 4000 });

console.log("🚀 WebSocket server running on ws://localhost:4000");

// Handle new connection
wss.on("connection", (ws) => {
  console.log("⚡ Client connected");

  // track session
  const session = {
    propertyId: null,
    userId: null,
    startTime: new Date(),
  };

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log("📩 Received:", data);

      if (data.propertyId) session.propertyId = data.propertyId;
      if (data.userId) session.userId = data.userId;
    } catch (e) {
      console.error("❌ Error parsing message:", e);
    }
  });

  ws.on("close", async () => {
    const endTime = new Date();
    const timeSeconds = Math.round((endTime - session.startTime) / 1000);

    console.log(timeSeconds,endTime);

    if (session.propertyId) {
      try {
        await pool.query(
          `INSERT INTO properties_seen_time 
           (property_id, user_id, time_seconds, start_time, end_time) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            session.propertyId,
            session.userId,
            timeSeconds,
            session.startTime,
            endTime,
          ]
        );
        console.log(
          `✅ Stored: propertyId=${session.propertyId}, userId=${session.userId}, time=${timeSeconds}s`
        );
      } catch (err) {
        console.error("❌ DB insert failed:", err);
      }
    } else {
      console.warn("⚠️ Skipped insert (no propertyId)");
    }
  });
});
