import mongoose from "mongoose";

const bannedUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  bannedAt: { type: Date, default: Date.now },
});

export default mongoose.model("BannedUser", bannedUserSchema);
