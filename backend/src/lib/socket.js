import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const userSocketMap = new Map();

export function GetRecieverSocketId(userId) {
  const socketIds = userSocketMap.get(userId);
  if (!socketIds || socketIds.size === 0) {
    console.warn(`GetReceiverSocketId: No socket found for user: ${userId}`);
    return null;
  }
  return socketIds.values().next().value;
}

function broadcastOnlineUsers() {
  const onlineUsers = Array.from(userSocketMap.keys());
  io.emit("getOnlineUsers", onlineUsers);
}

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  if (!userId || userId === "undefined") {
    console.error("Invalid or missing userId for socket:", socket.id, { userId });
    socket.disconnect(true);
    return;
  }
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);
  socket.join(`user:${userId}`);
  broadcastOnlineUsers();

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
    const room = [message.senderId, message.receiverId].sort().join("-");
    socket.to(room).emit("newMessage", {
      ...message,
      isRead: false,
    });
    socket.to(`user:${message.senderId}`).emit("newMessage", {
      ...message,
      isRead: true,
    });
  });

  socket.on("editMessage", ({ messageId, newText, senderId, receiverId }) => {
    if (!messageId || !newText || !senderId || !receiverId) {
      console.error("Invalid editMessage data:", { messageId, newText, senderId, receiverId });
      return;
    }
    const room = [senderId, receiverId].sort().join("-");
    const payload = {
      messageId,
      text: newText,
      edited: true,
      senderId,
      receiverId,
      updatedAt: new Date().toISOString(),
    };
    io.to(room).emit("messageEdited", payload);
  });

  socket.on("deleteMessage", ({ messageId, senderId, receiverId }) => {
    if (!messageId || !senderId || !receiverId) {
      console.error("Invalid deleteMessage data:", { messageId, senderId, receiverId });
      return;
    }
    const room = [senderId, receiverId].sort().join("-");
    const payload = { messageId, senderId, receiverId };
    io.to(room).emit("messageDeleted", payload);
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
      const socketSet = userSocketMap.get(userId);
      if (socketSet) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          userSocketMap.delete(userId);
        }
      }
      broadcastOnlineUsers();
    }
  });
});

export { io, server, app };