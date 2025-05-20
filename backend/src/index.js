import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
export const BaseUrl = "http://localhost:5173";
dotenv.config();
app.use(
  cors({
    origin:
    BaseUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const port = process.env.PORT;
server.listen(port, () => {
  console.log("Server is running on port " + port);
  connectDB();
});
