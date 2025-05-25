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

const userSocketMap = {};
io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  if (!userId || userId === "undefined") {
    console.error("Invalid or missing userId for socket:", socket.id, {
      userId,
    });
    socket.disconnect(true);
    return;
  }

  userSocketMap[userId] = socket.id;
  socket.join(`user:${userId}`);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinChat", ({ senderId, receiverId }) => {
    if (!senderId || !receiverId) {
      console.error("Invalid joinChat data:", { senderId, receiverId });
      return;
    }
    const room = [senderId, receiverId].sort().join("-");
    socket.join(room);
  });

  socket.on("newMessage", (message) => {
    if (!message.senderId || !message.receiverId || !message._id) {
      console.error("Invalid newMessage data:", message);
      return;
    }
    socket.to(`user:${message.receiverId}`).emit("newMessage", {
      ...message,
      isRead: message.senderId === userId,
    });

    socket.to(`user:${message.senderId}`).emit("newMessage", {
      ...message,
      isRead: true,
    });
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    if (!senderId || !receiverId) {
      console.error("Invalid typing data:", { senderId, receiverId });
      return;
    }
    const room = [senderId, receiverId].sort().join("-");
    socket.to(room).emit("userTyping", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    if (!senderId || !receiverId) {
      console.error("Invalid stopTyping data:", { senderId, receiverId });
      return;
    }
    const room = [senderId, receiverId].sort().join("-");
    socket.to(room).emit("userStoppedTyping", { senderId });
  });

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});
export { io, server, app };
