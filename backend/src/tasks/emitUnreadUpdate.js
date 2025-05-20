import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import { GetRecieverSocketId } from "../lib/socket.js";
import { debounce } from "../helpers/debounce.js";

export const emitUnreadUpdateLogic = async (userId, io) => {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          receiverId: objectId,
          read: false,
        },
      },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    const unreadMessagesObj = unreadMessages.reduce((acc, { _id, count }) => {
      acc[_id.toString()] = count;
      return acc;
    }, {});
    const totalUnread = unreadMessages.reduce(
      (sum, { count }) => sum + count,
      0
    );
    const payload = { unreadMessages: unreadMessagesObj, totalUnread };

    try {
      io.to(`user:${userId}`).emit("unreadUpdate", payload);
    } catch (err) {
      console.error(err);
    }

    const socketId = GetRecieverSocketId(userId);
    if (socketId && typeof socketId === "string") {
      try {
        io.to(socketId).emit("unreadUpdate", payload);
        console.log(`Emitted unreadUpdate to socketId: ${socketId}`);
      } catch (err) {
        console.error(`Error emitting to socketId: ${socketId}`, err);
      }
    } else {
      console.log(`No socketId found for user: ${userId}`);
    }

    return payload;
  } catch (error) {
    console.error(`emitUnreadUpdate error for user: ${userId}`, error);
    return { unreadMessages: {}, totalUnread: 0 };
  }
};

// Ensure debounced function correctly handles io
export const emitUnreadUpdate = debounce(emitUnreadUpdateLogic, 100);
