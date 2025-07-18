import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import path from "path";
import { app, server } from "./lib/socket.js";
import AuthRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import OwnerRoutes from "./Owner/owner.route.js";
import MessageRoutes from "./routes/message.route.js";
import FriendRoutes from "./routes/friends.route.js";
import WipeChatRoutes from "./routes/wipchat.route.js";
export const BaseUrl = "http://localhost:5173";

dotenv.config();
app.use(
  cors({
    origin: BaseUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const port = process.env.PORT || 5001;
const __dirname = path.resolve();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/owner", OwnerRoutes);
app.use("/api/friends", FriendRoutes);
app.use("/api/wipechat", WipeChatRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
server.listen(port, () => {
  console.log("Server is running on port " + port);
  connectDB();
});
