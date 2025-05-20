import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    codeAuthentication: {
      type: String,
      default: "",
    },
    codeAuthenticationExpires: { type: Date, default: null },
    codeType: {
      type: String,
      enum: [
        "disable_account",
        "delete_account",
        "reset_password",
        "email_verification",
        "change_password",
      ],
    },
    deletionData: {
      Restorable: {
        type: Boolean,
        default: false,
      },
      Disabled: {
        type: Boolean,
        default: false,
      },
    },
    lastLoggedIn: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.index({ friends: 1 });
userSchema.index({ blockedUsers: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
