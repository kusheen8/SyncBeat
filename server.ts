import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { SAMPLE_SONGS } from "./src/data/songs.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = process.env.PORT || 3000;

  // Room states in memory for rapid syncing
  // key: roomId, value: { isPlaying: boolean, currentTime: number, songId: string, lastUpdated: number }
  const roomStates = new Map<string, any>();

  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      
      // Send current state to the joining user
      if (roomStates.has(roomId)) {
        socket.emit("sync_state", roomStates.get(roomId));
      }
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on("play_song", (data: { roomId: string; songId: string; timestamp: number }) => {
      roomStates.set(data.roomId, {
        isPlaying: true,
        currentTime: data.timestamp,
        songId: data.songId,
        lastUpdated: Date.now(),
      });
      socket.to(data.roomId).emit("on_play", data);
    });

    socket.on("pause_song", (data: { roomId: string; timestamp: number }) => {
      const state = roomStates.get(data.roomId);
      if (state) {
        state.isPlaying = false;
        state.currentTime = data.timestamp;
        state.lastUpdated = Date.now();
      }
      socket.to(data.roomId).emit("on_pause", data);
    });

    socket.on("seek_song", (data: { roomId: string; timestamp: number }) => {
      const state = roomStates.get(data.roomId);
      if (state) {
        state.currentTime = data.timestamp;
        state.lastUpdated = Date.now();
      }
      socket.to(data.roomId).emit("on_seek", data);
    });

    socket.on("add_to_queue", (data: { roomId: string; song: any }) => {
      socket.to(data.roomId).emit("on_queue_added", data.song);
    });

    socket.on("room_chat", (data: { roomId: string; message: any }) => {
      socket.to(data.roomId).emit("on_chat_message", data.message);
    });

    socket.on("typing_status", (data: { roomId: string; username: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit("on_typing", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API Routes
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example REST API for songs (proxying or just returning sample data)
  app.get("/api/songs", (req, res) => {
    res.json(SAMPLE_SONGS);
  });

  // Example Room Creation API
  app.post("/api/rooms", (req, res) => {
    const { name, hostId } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    res.json({ id: `room-${Date.now()}`, name, code, hostId });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
