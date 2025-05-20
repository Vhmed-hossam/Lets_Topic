import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "friend_request_received",
      "friend_request_sent",
      "friend_request_accepted",
      "friend_request_declined",
      "block_initiated",
      "block_received",
      "unblock_initiated",
      "unblock_received",
      "unfriend_initiated",
      "unfriend_received",
      "wipe_chat_request",
      "wipe_chat_accepted",
      "wipe_chat_declined",
      "wipe_chat_request_sent",
      "account_deleted",
      "report_sent"
    ],
    required: true,
  },
  message: { type: String, required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
