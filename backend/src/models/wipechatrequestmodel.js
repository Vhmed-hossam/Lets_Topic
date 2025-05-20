import mongoose from "mongoose";
const WipeChatRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

WipeChatRequestSchema.index({ sender: 1, recipient: 1, status: 1 });
WipeChatRequestSchema.index({ recipient: 1, status: 1 });

const WipeChatRequest =
  mongoose.models.WipeChatRequest ||
  mongoose.model("WipeChatRequest", WipeChatRequestSchema);
export default WipeChatRequest;
