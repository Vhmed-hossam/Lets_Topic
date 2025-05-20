import WipeChatRequest from "../models/wipechatrequestmodel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationmodel.js";
import Message from "../models/messageModel.js";

export const requestWipeChat = async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user._id;
  const io = req.app.get("socketio");

  try {
    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }

    if (recipientId.toString() === senderId.toString()) {
      return res
        .status(400)
        .json({ message: "You can't send a wipe request to yourself" });
    }

    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    if (
      recipient.blockedUsers.some((id) => id.toString() === senderId.toString())
    ) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    const existingRequest = await WipeChatRequest.findOne({
      sender: sender._id,
      recipient: recipient._id,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Wipe chat request already sent" });
    }

    const wipeChatRequest = await WipeChatRequest.create({
      sender: sender._id,
      recipient: recipient._id,
      status: "pending",
    });

    await recipient.save();

    const [recipientNotif, senderNotif] = await Promise.all([
      Notification.create({
        recipient: recipient._id,
        sender: sender._id,
        type: "wipe_chat_request",
        message: `${sender.username} requested to wipe your chat history!`,
        requestId: wipeChatRequest._id,
      }),
      Notification.create({
        recipient: sender._id,
        sender: sender._id,
        type: "wipe_chat_request_sent",
        message: `You sent a wipe chat request to ${recipient.username}!`,
        requestId: wipeChatRequest._id,
      }),
    ]);

    if (io) {
      io.to(recipientId.toString()).emit("newNotification", {
        ...recipientNotif.toObject(),
        sender: {
          _id: sender._id,
          username: sender.username,
          profilePic: sender.profilePic,
          fullName: sender.fullName,
        },
      });

      io.to(senderId.toString()).emit("newNotification", {
        ...senderNotif.toObject(),
        sender: {
          _id: sender._id,
          username: sender.username,
          profilePic: sender.profilePic,
          fullName: sender.fullName,
        },
      });

      io.to(recipientId.toString()).emit("newWipeChatRequest", {
        _id: wipeChatRequest._id,
        sender: {
          _id: sender._id,
          username: sender.username,
          profilePic: sender.profilePic,
          fullName: sender.fullName,
        },
        createdAt: wipeChatRequest.createdAt,
      });

      io.to(senderId.toString()).emit("wipeChatRequestSent", {
        _id: wipeChatRequest._id,
        recipient: {
          _id: recipient._id,
          username: recipient.username,
          profilePic: recipient.profilePic,
          fullName: recipient.fullName,
        },
        createdAt: wipeChatRequest.createdAt,
      });
    }

    res.status(200).json({
      success: true,
      message: "Wipe chat request sent successfully",
      requestId: wipeChatRequest._id,
    });
  } catch (err) {
    console.error("Wipe chat request error:", err);
    res.status(500).json({
      message: "Server error processing wipe chat request",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const acceptWipeChatRequest = async (req, res) => {
  const { requestId } = req.params;
  const io = req.app.get("socketio");

  try {
    const wipeChatRequest = await WipeChatRequest.findById(requestId)
      .populate("sender", "username profilePic fullName")
      .populate("recipient", "username profilePic fullName");

    if (!wipeChatRequest) {
      return res.status(404).json({ message: "Wipe chat request not found" });
    }

    if (wipeChatRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Wipe chat request is not pending" });
    }

    const user = await User.findById(wipeChatRequest.recipient._id);
    const sender = await User.findById(wipeChatRequest.sender._id);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (wipeChatRequest.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    wipeChatRequest.status = "accepted";
    await wipeChatRequest.save();

    await user.save();

    await Message.deleteMany({
      $or: [
        {
          senderId: wipeChatRequest.sender._id,
          receiverId: wipeChatRequest.recipient._id,
        },
        {
          senderId: wipeChatRequest.recipient._id,
          receiverId: wipeChatRequest.sender._id,
        },
      ],
    });

    await Notification.deleteMany({
      $or: [
        {
          recipient: { $in: [user._id, sender._id] },
          requestId: wipeChatRequest._id,
          type: { $in: ["wipe_chat_request", "wipe_chat_request_sent"] },
        },
      ],
    });

    const [userNotif, senderNotif] = await Promise.all([
      Notification.create({
        recipient: user._id,
        sender: sender._id,
        type: "wipe_chat_accepted",
        message: `You accepted ${sender.username}'s wipe chat request!`,
        requestId: wipeChatRequest._id,
      }),
      Notification.create({
        recipient: sender._id,
        sender: user._id,
        type: "wipe_chat_accepted",
        message: `${user.username} accepted your wipe chat request!`,
        requestId: wipeChatRequest._id,
      }),
    ]);

    if (io) {
      io.to(user._id.toString()).emit("newNotification", {
        ...userNotif.toObject(),
        sender: {
          _id: sender._id,
          username: sender.username,
          profilePic: sender.profilePic,
          fullName: sender.fullName,
        },
      });
      io.to(sender._id.toString()).emit("newNotification", {
        ...senderNotif.toObject(),
        sender: {
          _id: user._id,
          username: user.username,
          profilePic: user.profilePic,
          fullName: user.fullName,
        },
      });

      io.to(user._id.toString()).emit("removeNotification", {
        requestId: wipeChatRequest._id,
        type: "wipe_chat_request",
      });
      io.to(sender._id.toString()).emit("removeNotification", {
        requestId: wipeChatRequest._id,
        type: "wipe_chat_request_sent",
      });

      io.to(user._id.toString()).emit("removePendingWipeRequest", requestId);

      io.to(sender._id.toString()).emit("updateWipeRequestStatus", {
        requestId: wipeChatRequest._id,
        status: "accepted",
      });

      io.to(user._id.toString()).emit("chatWiped", {
        userId: sender._id.toString(),
        message: "Chat history has been cleared",
      });
      io.to(sender._id.toString()).emit("chatWiped", {
        userId: user._id.toString(),
        message: "Chat history has been cleared",
      });
    }
    const updatedNotifications = await Notification.find({
      recipient: user._id,
    }).populate("sender", "username profilePic fullName");
    res.status(200).json({
      success: true,
      message: "Wipe chat request accepted",
      requestId: wipeChatRequest._id,
      notifications: updatedNotifications,
    });
  } catch (err) {
    console.error("Accept wipe chat request error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const declineWipeChatRequest = async (req, res) => {
  const { requestId } = req.params;
  const io = req.app.get("socketio");

  try {
    const wipeChatRequest = await WipeChatRequest.findById(requestId)
      .populate("sender", "username profilePic fullName")
      .populate("recipient", "username profilePic fullName");

    if (!wipeChatRequest) {
      return res.status(404).json({ message: "Wipe chat request not found" });
    }

    if (wipeChatRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Wipe chat request is not pending" });
    }

    const user = await User.findById(wipeChatRequest.recipient._id);
    const sender = await User.findById(wipeChatRequest.sender._id);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (wipeChatRequest.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    wipeChatRequest.status = "declined";
    await wipeChatRequest.save();

    await user.save();

    await Notification.deleteMany({
      $or: [
        {
          recipient: { $in: [user._id, sender._id] },
          requestId: wipeChatRequest._id,
          type: { $in: ["wipe_chat_request", "wipe_chat_request_sent"] },
        },
      ],
    });

    const [userNotif, senderNotif] = await Promise.all([
      Notification.create({
        recipient: user._id,
        sender: user._id,
        type: "wipe_chat_declined",
        message: `You declined ${sender.username}'s wipe chat request`,
        requestId: wipeChatRequest._id,
        sender: {
          _id: sender._id,
          username: sender.username,
          profilePic: sender.profilePic,
          fullName: sender.fullName,
        },
      }),
      Notification.create({
        recipient: sender._id,
        sender: user._id,
        type: "wipe_chat_declined",
        message: `${user.username} declined your wipe chat request`,
        requestId: wipeChatRequest._id,
        sender: {
          _id: sender._id,
          username: sender.username,
          profilePic: sender.profilePic,
          fullName: sender.fullName,
        },
      }),
    ]);

    if (io) {
      io.to(user._id.toString()).emit("newNotification", {
        ...userNotif.toObject(),
        sender: {
          _id: user._id,
          username: user.username,
          profilePic: user.profilePic,
          fullName: user.fullName,
        },
      });
      io.to(sender._id.toString()).emit("newNotification", {
        ...senderNotif.toObject(),
        sender: {
          _id: user._id,
          username: user.username,
          profilePic: user.profilePic,
          fullName: user.fullName,
        },
      });

      io.to(user._id.toString()).emit("removeNotification", {
        requestId: wipeChatRequest._id,
        type: "wipe_chat_request",
      });
      io.to(sender._id.toString()).emit("removeNotification", {
        requestId: wipeChatRequest._id,
        type: "wipe_chat_request_sent",
      });

      io.to(user._id.toString()).emit("removePendingWipeRequest", requestId);

      io.to(sender._id.toString()).emit("updateWipeRequestStatus", {
        requestId: wipeChatRequest._id,
        status: "declined",
      });
    }
    const updatedNotifications = await Notification.find({
      recipient: user._id,
    }).populate("sender", "username profilePic fullName");
    res.status(200).json({
      success: true,
      message: "Wipe chat request declined",
      requestId: wipeChatRequest._id,
      notifications: updatedNotifications,
    });
  } catch (err) {
    console.error("Decline wipe chat request error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
