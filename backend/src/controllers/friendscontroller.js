import Notification from "../models/notificationmodel.js";
import User from "../models/userModel.js";
import FriendRequest from "../models/friendrequestmodel.js";
import mongoose from "mongoose";

export const sendFriendRequest = async (req, res) => {
  const { senderUsername, recipientUsername } = req.body;
  const io = req.app.get("socketio");

  try {
    if (!senderUsername || !recipientUsername) {
      return res.status(400).json({ message: "Both usernames are required" });
    }

    if (senderUsername === recipientUsername) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }

    const [sender, recipient] = await Promise.all([
      User.findOne({ username: senderUsername }),
      User.findOne({ username: recipientUsername }),
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    const senderId = sender._id.toString();
    const recipientId = recipient._id.toString();

    if (recipient.blockedUsers.some((id) => id.toString() === senderId)) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    if (sender.blockedUsers.some((id) => id.toString() === recipientId)) {
      return res.status(403).json({ message: "You have blocked this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: sender._id,
      recipient: recipient._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    if (recipient.friends.some((id) => id.toString() === senderId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    const friendRequest = await FriendRequest.create({
      sender: sender._id,
      recipient: recipient._id,
      status: "pending",
    });

    await recipient.save();

    const [reqNotif, senderNotif] = await Promise.all([
      Notification.create({
        recipient: recipient._id,
        sender: sender._id,
        type: "friend_request_received",
        message: `${sender.username} sent you a friend request!`,
        requestId: friendRequest._id,
      }),
      Notification.create({
        recipient: sender._id,
        sender: sender._id,
        type: "friend_request_sent",
        message: `You sent a friend request to ${recipient.username}!`,
        requestId: friendRequest._id,
      }),
    ]);

    if (io) {
      io.to(recipientId).emit("newNotification", reqNotif);
      io.to(senderId).emit("newNotification", senderNotif);
    }

    res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
      requestId: friendRequest._id,
    });
  } catch (err) {
    console.error("Friend request error:", err);
    res.status(500).json({
      message: "Server error processing friend request",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const io = req.app.get("socketio");

  try {
    const friendRequest = await FriendRequest.findById(requestId)
      .populate("sender", "username")
      .populate("recipient", "username");

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Friend request is not pending" });
    }

    const user = await User.findById(friendRequest.recipient);
    const friend = await User.findById(friendRequest.sender);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends.push(friend._id);
    friend.friends.push(user._id);

    friendRequest.status = "accepted";
    await friendRequest.save();

    const [userNotif, friendNotif] = await Promise.all([
      Notification.create({
        recipient: user._id,
        sender: friend._id,
        type: "friend_request_accepted",
        message: `You accepted ${friend.username}'s friend request!`,
        requestId: friendRequest._id,
      }),
      Notification.create({
        recipient: friend._id,
        sender: user._id,
        type: "friend_request_accepted",
        message: `${user.username} accepted your friend request!`,
        requestId: friendRequest._id,
      }),
    ]);
    await Promise.all([user.save(), friend.save()]);

    await Notification.deleteOne({
      recipient: user._id,
      sender: friend._id,
      type: "friend_request_received",
      requestId: friendRequest._id,
    });

    if (io) {
      io.to(user._id.toString()).emit("newNotification", userNotif);
      io.to(friend._id.toString()).emit("newNotification", friendNotif);
      io.to(user._id.toString()).emit(
        "friendRequestAccepted",
        friend._id.toString()
      );
      io.to(friend._id.toString()).emit(
        "friendRequestAccepted",
        user._id.toString()
      );
    }

    const updatedNotifications = await Notification.find({
      recipient: user._id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "fullName profilePic");

    res.status(200).json({
      success: true,
      message: "Friend request accepted",
      notifications: updatedNotifications,
    });
  } catch (err) {
    console.error("Accept friend request error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const refuseFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const io = req.app.get("socketio");

  try {
    const friendRequest = await FriendRequest.findById(requestId)
      .populate("sender", "username")
      .populate("recipient", "username");

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Friend request is not pending" });
    }

    const user = await User.findById(friendRequest.recipient);
    const sender = await User.findById(friendRequest.sender);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.save();

    friendRequest.status = "refused";
    await friendRequest.save();

    const [notifToSender, notifToUser] = await Promise.all([
      Notification.create({
        recipient: sender._id,
        sender: user._id,
        type: "friend_request_declined",
        message: `${user.username} declined your friend request`,
        requestId: friendRequest._id,
      }),
      Notification.create({
        recipient: user._id,
        sender: user._id,
        type: "friend_request_declined",
        message: `You declined ${sender.username}'s friend request`,
        requestId: friendRequest._id,
      }),
    ]);
    await Notification.deleteOne({
      recipient: user._id,
      sender: sender._id,
      type: "friend_request_received",
      requestId: friendRequest._id,
    });

    if (io) {
      io.to(sender._id.toString()).emit("newNotification", notifToSender);
      io.to(user._id.toString()).emit("newNotification", notifToUser);
    }

    const updatedNotifications = await Notification.find({
      recipient: user._id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "fullName profilePic");

    res.status(200).json({
      success: true,
      message: "Friend request declined",
      notifications: updatedNotifications,
    });
  } catch (err) {
    console.error("Refuse friend request error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const blockUser = async (req, res) => {
  const { userId, blockUserId } = req.body;
  const io = req.app.get("socketio");

  try {
    if (userId === blockUserId) {
      return res.status(400).json({ message: "You can't block yourself" });
    }

    const [user, blockedUser] = await Promise.all([
      User.findById(userId),
      User.findById(blockUserId),
    ]);

    if (!user || !blockedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.blockedUsers.includes(blockUserId)) {
      user.blockedUsers.push(blockUserId);
    }

    user.friends = user.friends.filter((id) => id.toString() !== blockUserId);
    blockedUser.friends = blockedUser.friends.filter(
      (id) => id.toString() !== userId
    );

    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: userId, recipient: blockUserId },
        { sender: blockUserId, recipient: userId },
      ],
      status: "pending",
    });

    const requestIds = friendRequests.map((req) => req._id);

    const [initiatorNotif, blockedNotif] = await Promise.all([
      Notification.create({
        recipient: userId,
        sender: userId,
        type: "block_initiated",
        message: `You blocked ${blockedUser.username}`,
      }),
      Notification.create({
        recipient: blockUserId,
        sender: userId,
        type: "block_received",
        message: `${user.username} blocked you`,
      }),
      user.save(),
      blockedUser.save(),
      FriendRequest.updateMany(
        { _id: { $in: requestIds } },
        { status: "refused" }
      ),
    ]);
    if (io) {
      io.to(userId.toString()).emit("newNotification", initiatorNotif);
      io.to(blockUserId.toString()).emit("newNotification", blockedNotif);
    }

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      notifications: {
        toInitiator: initiatorNotif,
        toBlocked: blockedNotif,
      },
    });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getFriendsList = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "friends",
      "username fullName profilePic createdAt bio banner"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ friends: user.friends });
  } catch (err) {
    console.error("Get friends list error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getBlockedUsers = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "blockedUsers",
      "username fullName profilePic"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ blockedUsers: user.blockedUsers });
  } catch (err) {
    console.error("Get blocked users error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
export const unfriendUser = async (req, res) => {
  const { userId, friendId } = req.body;
  const io = req.app.get("socketio");

  try {
    if (!userId || !friendId) {
      return res
        .status(400)
        .json({ message: "userId and friendId are required" });
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(friendId)
    ) {
      console.warn(
        `Invalid ObjectId - userId: ${userId}, friendId: ${friendId}`
      );
      return res
        .status(400)
        .json({ message: "Invalid userId or friendId format" });
    }
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId },
      ],
      status: "pending",
    });

    const requestIds = friendRequests.map((req) => req._id);

    await Promise.all([
      user.save(),
      friend.save(),
      FriendRequest.updateMany(
        { _id: { $in: requestIds } },
        { status: "refused" }
      ),
    ]);

    const [initiatorNotif, friendNotif] = await Promise.all([
      Notification.create({
        recipient: userId,
        sender: userId,
        type: "unfriend_initiated",
        message: `You unfriended ${friend.username}`,
      }),
      Notification.create({
        recipient: friendId,
        sender: userId,
        type: "unfriend_received",
        message: `${user.username} unfriended you`,
      }),
    ]);

    if (io) {
      io.to(userId.toString()).emit("newNotification", initiatorNotif);
      io.to(friendId.toString()).emit("newNotification", friendNotif);
      console.log(
        `Emitted notifications - userId: ${userId}, friendId: ${friendId}`
      );
    } else {
      console.warn("Socket.IO instance not available");
    }

    res.status(200).json({
      success: true,
      message: "Unfriended successfully",
      notifications: {
        toInitiator: initiatorNotif,
        toFriend: friendNotif,
      },
    });
  } catch (err) {
    console.error("Unfriend error:", {
      error: err.message,
      userId,
      friendId,
      stack: err.stack,
    });
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const unblockUser = async (req, res) => {
  const { userId, unblockUserId } = req.body;
  const io = req.app.get("socketio");

  try {
    const [user, unblockedUser] = await Promise.all([
      User.findById(userId),
      User.findById(unblockUserId),
    ]);

    if (!user || !unblockedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.blockedUsers.includes(unblockUserId)) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== unblockUserId
    );
    await user.save();

    const [initiatorNotif, unblockedNotif] = await Promise.all([
      Notification.create({
        recipient: userId,
        sender: userId,
        type: "unblock_initiated",
        message: `You unblocked ${unblockedUser.username}`,
      }),
      Notification.create({
        recipient: unblockUserId,
        sender: userId,
        type: "unblock_received",
        message: `${user.username} unblocked you`,
      }),
    ]);

    if (io) {
      io.to(userId.toString()).emit("newNotification", initiatorNotif);
      io.to(unblockUserId.toString()).emit("newNotification", unblockedNotif);
    }

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      notifications: {
        toInitiator: initiatorNotif,
        toUnblocked: unblockedNotif,
      },
    });
  } catch (err) {
    console.error("Unblock user error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        error: "Unauthorized to fetch notifications for this user",
      });
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePic fullName")
      .limit(50);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const clearNotifications = async (req, res) => {
  const { userId: paramUserId } = req.params;
  const loggedInUserId = req.user._id.toString();

  try {
    if (!mongoose.Types.ObjectId.isValid(paramUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (paramUserId !== loggedInUserId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await Notification.deleteMany({
      recipient: paramUserId,
      type: { $nin: ["friend_request_received", "wipe_chat_request"] },
    });

    res.status(200).json({
      message:
        result.deletedCount > 0
          ? "Notifications cleared successfully"
          : "No notifications found to clear",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(
      `Error clearing notifications for user ${loggedInUserId}:`,
      error
    );
    res.status(500).json({ error: "Failed to clear notifications" });
  }
};

export const deleteNotification = async (req, res) => {
  const { userId } = req.params;
  const { notificationId } = req.body;

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await Notification.deleteOne({ _id: notificationId });

    const updatedNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "fullName profilePic");

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      notifications: updatedNotifications,
    });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
