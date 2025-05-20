import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "refused"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

friendRequestSchema.index({ sender: 1, recipient: 1, status: 1 });
friendRequestSchema.index({ recipient: 1, status: 1 });

const FriendRequest =
  mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
