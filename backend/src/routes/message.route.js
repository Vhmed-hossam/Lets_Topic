import express from "express";
import { protectRoute } from "../middleware/authmiddleware.js";
import {
  getMessages,
  getUsersForSidebar,
  SendMessage,
  DeleteMessage,
  UpdateMessage,
  getUnreadCount,
  getUnreadCounts,
  markAsRead,
  getChatMedia,SetAllRead
} from "../controllers/messagecontroller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/unread-counts/:userId", protectRoute, getUnreadCounts);
router.get("/unread-count/:userId", protectRoute, getUnreadCount);
router.get("/:id", protectRoute, getMessages);
router.post("/send-message/:receiverId", protectRoute, SendMessage);
router.put("/update-message/:id", protectRoute, UpdateMessage);
router.delete("/delete-message/:id", protectRoute, DeleteMessage);
router.put("/mark-read/:senderId", protectRoute, markAsRead);
router.get("/chat-media/:id", protectRoute, getChatMedia);
router.put("/reset-all-unread/:userId", protectRoute, SetAllRead);

export default router;
