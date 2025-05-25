import Message from "../models/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/userModel.js";
import { GetRecieverSocketId, io } from "../lib/socket.js";
import { emitUnreadUpdateLogic } from "../tasks/emitUnreadUpdate.js";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const TheUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      TheUsers,
    });
  } catch (error) {
    console.error("getUsersForSidebar error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const MyId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: MyId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: MyId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
    res.status(200).json({
      message: "Messages fetched successfully",
      messages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const SendMessage = async (req, res) => {
  try {
    const { text, image, voiceMessage, video } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user?._id;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const recipient = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      recipient.blockedUsers.some((id) => id.toString() === senderId.toString())
    ) {
      return res.status(403).json({ error: "You are blocked by this user" });
    }

    if (
      sender.blockedUsers.some((id) => id.toString() === receiverId.toString())
    ) {
      return res.status(403).json({ error: "You have blocked this user" });
    }
    if (!sender.friends.includes(receiverId)) {
      return res
        .status(403)
        .json({ error: "You are not friends with this user" });
    }

    let imageUrl;
    let voiceUrl;
    let videoUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    if (voiceMessage) {
      const audioBuffer = Buffer.from(voiceMessage, "base64");
      const uploadResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "voice-messages" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return reject(
                new Error("Failed to upload voice message to Cloudinary")
              );
            }
            resolve(result);
          }
        );
        stream.end(audioBuffer);
      });

      voiceUrl = uploadResponse.secure_url;
    }
    if (video) {
      const videoBuffer = Buffer.from(video, "base64");

      const maxSize = 20 * 1024 * 1024;
      if (videoBuffer.length > maxSize) {
        return res.status(400).json({ error: "Video size exceeds 20MB limit" });
      }

      const uploadResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "video-messages" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary video upload error:", error);
              return reject(new Error("Failed to upload video to Cloudinary"));
            }
            resolve(result);
          }
        );
        stream.end(videoBuffer);
      });

      videoUrl = uploadResponse.secure_url;
    }
    const type = videoUrl
      ? "video"
      : voiceUrl
      ? "voice"
      : imageUrl
      ? "image"
      : "text";
    const NewMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
      voiceUrl,
      videoUrl,
      type,
      read: false,
    });

    await NewMessage.save();
    const receiverSocketId = GetRecieverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(`user:${receiverId}`).emit("newMessage", NewMessage);
      await emitUnreadUpdateLogic(receiverId, io);
    } else {
      console.warn("SendMessage: No socket for receiver:", receiverId);
    }
    await emitUnreadUpdateLogic(senderId, io);

    res.status(201).json({ message: "Message sent successfully", NewMessage });
  } catch (error) {
    console.error("SendMessage server error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const DeleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { userToChatId } = req.body;
  const myId = req.user._id;

  if (!messageId) {
    return res.status(400).json({
      error: "Message ID is required",
    });
  }

  if (!userToChatId) {
    return res.status(400).json({
      error: "User to chat ID is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).json({ error: "Invalid message ID format" });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== myId.toString()) {
      return res.status(403).json({
        error: "Unauthorized: You can only delete your own messages",
      });
    }

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Failed to delete message" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      message: "Message deleted successfully",
      messages,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid message ID format" });
    }

    console.error("DeleteMessage error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const UpdateMessage = async (req, res) => {
  const { id: messageId } = req.params;
  const { NewText, userToChatId } = req.body;
  const myId = req.user._id;

  if (!messageId || !NewText || !userToChatId) {
    return res.status(400).json({
      error: "Message ID, new text, and recipient ID are required",
    });
  }

  if (NewText.trim() === "") {
    return res.status(400).json({ error: "New text cannot be empty" });
  }

  try {
    const message = await Message.findById(messageId).populate("text");
    if (NewText === message.text) {
      return res.status(400).json({ error: "No Changes occoured" });
    }
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== myId.toString()) {
      return res.status(403).json({
        error: "Unauthorized: You can only edit your own messages",
      });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        text: NewText,
        edited: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Failed to update message" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      message: "Message updated successfully",
      updatedMessage,
      messages,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid message ID format" });
    }

    console.error("UpdateMessage error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUnreadCounts = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          receiverId: authUserId,
          read: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);
    const unreadMessagesMap = unreadMessages.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});
    const totalUnread = Object.values(unreadMessagesMap).reduce(
      (sum, count) => sum + count,
      0,
      0
    );
    res.status(200).json({ unreadMessages: unreadMessagesMap, totalUnread });
  } catch (error) {
    console.error("getUnreadCounts error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const authUserId = req.user._id;
    const result = await Message.updateMany(
      { receiverId: authUserId, senderId, read: false },
      { $set: { read: true } }
    );

    if (result.modifiedCount > 0) {
      await emitUnreadUpdateLogic(authUserId, io);
    }
    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getChatMedia = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const MyId = req.user._id;
    const mediaMessages = await Message.find({
      $or: [
        { senderId: MyId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: MyId },
      ],
      type: { $in: ["image", "voice", "video"] },
    })
      .sort({ createdAt: -1 })
      .lean()
      .select("-text");
    if (mediaMessages.length === 0) {
      return res.status(200).json({
        message: "No media messages found",
        mediaMessages,
      });
    }
    res.status(200).json({
      message: "Chat media fetched successfully",
      mediaMessages,
    });
  } catch (error) {
    console.error("getChatMedia error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const SetAllRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Message.updateMany(
      { receiverId: userId, read: false },
      { $set: { read: true } }
    );
    await emitUnreadUpdateLogic(userId, io);
    res.status(200).json({
      message: "All messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("ResetAllUnread error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
