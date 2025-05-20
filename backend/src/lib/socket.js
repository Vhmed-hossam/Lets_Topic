import { Server } from "socket.io";
import http from "http";
import express from "express";
import { BaseUrl } from "../index.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

export function GetRecieverSocketId(userId) {
  const socketId = userSocketMap[userId];
  if (!socketId) {
    console.warn(`GetRecieverSocketId: No socket found for user: ${userId}`);
  }
  return socketId;
}


export { io, server, app };
