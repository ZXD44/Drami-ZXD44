import "dotenv/config";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import http from "http";
import cors from "cors";

import { GameRoom } from "./rooms/GameRoom";
import { connectDB } from "./db";
import { initLogger, logError } from "./utils/logger";
import { printUsers } from "./utils/debug";

// Routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const port = Number(process.env.PORT || 2567);
let databaseReady = false;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize Logger
initLogger();

// ----------------------------------------------------
// Colyseus Server Initialization
// ----------------------------------------------------
const server = http.createServer(app);
const gameServer = new Server({
    transport: new WebSocketTransport({
        server: server,
        pingInterval: 5000,
        pingMaxRetries: 3
    })
});

gameServer.define("game", GameRoom);

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------
app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "game-server",
        port,
        databaseReady
    });
});

app.use("/", authRoutes); // /login, /register
app.use("/api/admin", adminRoutes); // /api/admin/*
app.use("/api", userRoutes); // /api/update-avatar

// ----------------------------------------------------
// Bootstrap Server
// ----------------------------------------------------
async function bootstrap() {
    databaseReady = await connectDB();
    if (databaseReady) await printUsers();
    
    // In Colyseus v0.15, gameServer.listen(port) automatically handles
    // both WebSocket and Matchmaking routes if the server is provided in transport.
    await gameServer.listen(port);
    
    console.log(`[GameServer] v0.15 listening on port ${port}`);
    console.log(`[GameServer] CORS origin allowed: Any`);
}

bootstrap().catch((error) => {
    logError("[GameServer] Startup failed", error);
    process.exit(1);
});
