import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../lib/cloudinary.js";
import sendEmail from "../tasks/sendEmail.js";
import { generateAuthCode } from "../lib/Authcode.js";
import { generateUsername } from "../helpers/NameTousername.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationmodel.js";
import mongoose from "mongoose";
import { BaseUrl } from "../index.js";
import SendMessageEmail from "../tasks/SendMessageEmail.js";
import BannedUser from "../Owner/bannedModel.js";
import SendCodeEmail from "../tasks/sendCodeEmail.js";
import Report from "../models/ReportModel.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const bannedUser = await BannedUser.findOne({ email });
    if (bannedUser) {
      return res.status(403).json({
        error: "This email is banned and cannot be used to create an account",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUsername = generateUsername(fullName);
    const codeAuthentication = generateAuthCode();
    const codeExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      username: newUsername,
      isVerified: false,
      codeAuthentication,
      codeAuthenticationExpires: codeExpiration,
      codeType: "email_verification",
    });

    await newUser.save();

    await sendEmail(
      fullName,
      email,
      codeAuthentication,
      "Verify Your Email",
      "Please use the code below to verify your email address:",
      `${BaseUrl}/verify-email`
    );

    res.status(201).json({
      message:
        "User created successfully. Please verify your email to continue.",
      user: {
        fullName: newUser.fullName,
        email: newUser.email,
        _id: newUser._id,
        profilePic: newUser.profilePic,
        banner: newUser.banner,
        bio: newUser.bio,
        isVerified: newUser.isVerified,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      user.codeAuthentication !== code ||
      user.codeType !== "email_verification"
    ) {
      return res.status(400).json({ error: "Invalid authentication code" });
    }
    if (user.codeAuthenticationExpires < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    user.isVerified = true;
    user.codeAuthentication = null;
    user.codeAuthenticationExpires = null;
    user.codeType = null;
    await user.save();

    res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    console.error("VerifyCode error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email) {
      console.error("Email is missing in the request body");
      return res.status(400).json({ error: "Email is required" });
    }
    if (!code) {
      console.error("Code is missing in the request body");
      return res.status(400).json({ error: "Code is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    if (
      user.codeAuthentication !== code ||
      user.codeType !== "email_verification"
    ) {
      console.error("Provided code does not match or incorrect code type");
      return res.status(400).json({ error: "Invalid authentication code" });
    }
    if (user.codeAuthenticationExpires < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    user.isVerified = true;
    user.codeAuthentication = null;
    user.codeAuthenticationExpires = null;
    user.codeType = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("VerifyEmail error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Incorrect Email or Password" });
    }

    if (!user.isVerified) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const shouldResendCode =
        !user.lastLoggedIn || user.lastLoggedIn <= twentyFourHoursAgo;

      if (shouldResendCode) {
        const codeAuthentication = generateAuthCode();
        const codeExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.codeAuthentication = codeAuthentication;
        user.codeAuthenticationExpires = codeExpiration;
        user.codeType = "email_verification";
        user.lastLoggedIn = new Date();
        await user.save();
        await sendEmail(
          user.fullName,
          email,
          codeAuthentication,
          "Enter Login Code",
          `We detected a new login to your Let's Topic account. Please use the code below to log in:`,
          `${BaseUrl}/verify-email`
        );
      }

      return res.status(400).json({
        error:
          "Please verify your email first. A new verification code may have been sent.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect Email or Password" });
    }

    user.lastLoggedIn = new Date();
    await user.save();
    const token = generateToken(user._id, res);

    res.status(200).json({
      message: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
        _id: user._id,
        username: user.username,
        profilePic: user.profilePic,
        banner: user.banner,
        bio: user.bio,
        token: token,
        deletionData: {
          Restorable: user.deletionData?.Restorable,
          Disabled: user.deletionData?.Disabled,
        },
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoggedIn: user.lastLoggedIn,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.save();
    res.clearCookie("token");

    res.status(200).json({
      message: "Logged out successfully",
      token: null,
      user: {
        _id: user._id,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ error: "Profile picture is required" });
    }

    const uploadResult = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResult.secure_url,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyToken = (req, res) => {
  try {
    const token = req.cookies?.token || req.headers["token"] || req.query.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return res.status(200).json({
      message: "Token is valid",
      user: decoded,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("GetUserById error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Authenticated",
      user: req.user,
    });
  } catch (error) {
    console.error("CheckAuth error:", error);
    res.clearCookie("token");
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const changeName = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user._id;

    if (!fullName) {
      return res.status(400).json({ error: "New Name is required" });
    }
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }
    if (fullName.length >= 30) {
      return res
        .status(400)
        .json({ error: "Name must be less than 30 characters" });
    }
    if (fullName.length <= 2) {
      return res
        .status(400)
        .json({ error: "Name must be more than 2 characters" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true }
    );
    res.status(200).json({
      message: "Name updated successfully",
      user: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        username: updatedUser.username,
        _id: updatedUser._id,
        profilePic: updatedUser.profilePic,
        banner: updatedUser.banner,
        bio: updatedUser.bio,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error) {
    console.error("ChangeName error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UploadBanner = async (req, res) => {
  try {
    const { banner } = req.body;
    const userId = req.user._id;

    if (!banner) {
      return res.status(400).json({ error: "Banner is required" });
    }
    const uploadResult = await cloudinary.uploader.upload(banner);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        banner: uploadResult.secure_url,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "Banner uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UploadBanner error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AddBio = async (req, res) => {
  try {
    const { bio } = req.body;
    const userId = req.user._id;

    if (bio.length >= 190) {
      return res
        .status(400)
        .json({ error: "Bio must be less than 190 characters" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        bio,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "Bio updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("AddBio error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password, email } = req.body;
    const { id } = req.params;
    const userId = req.user?._id;
    if (!id) {
      return res.status(400).json({ error: "User ID parameter is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid paramId:", id);
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (!userId) {
      console.error("req.user._id is missing:", req.user);
      return res.status(401).json({ error: "User not authenticated" });
    }
    if (id !== userId.toString()) {
      console.error("ID mismatch - paramId:", id, "userId:", userId.toString());
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this account" });
    }

    const user = await User.findById(userId).select(
      "password email username fullName"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(400).json({ error: "Incorrect Email" });
    }
    if (!user.password) {
      console.error("User password is undefined for userId:", userId);
      return res
        .status(500)
        .json({ error: "User account is missing password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect Password" });
    }

    const verificationCode = generateAuthCode();
    const codeExpiration = new Date(Date.now() + 15 * 60 * 1000);

    user.codeAuthentication = verificationCode;
    user.codeAuthenticationExpires = codeExpiration;
    user.codeType = "delete_account";
    await user.save();

    await SendCodeEmail(
      user.fullName,
      user.email,
      verificationCode,
      "We received a request to delete your Let's Topic account , please use the code below to confirm this action."
    );

    res.status(200).json({
      message:
        "Verification email sent. Please check your email to confirm account deletion.",
    });
  } catch (error) {
    console.error("DeleteAccount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const confirmDeleteAccount = async (req, res) => {
  try {
    const { code, password } = req.body;
    const userId = req.user._id;

    if (req.params.id !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this account" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (!code) {
      return res.status(400).json({ error: "Verification code is required" });
    }

    const user = await User.findById(userId).select(
      "codeAuthentication codeAuthenticationExpires codeType password friends username email"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect Password" });
    }
    if (!user.codeAuthentication || user.codeAuthentication !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    if (user.codeAuthenticationExpires < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }
    if (user.codeType !== "delete_account") {
      return res
        .status(400)
        .json({ error: "Invalid code type for account deletion" });
    }

    user.codeAuthentication = null;
    user.codeAuthenticationExpires = null;
    user.codeType = null;
    await user.save();

    const friends = user.friends || [];

    const notificationPromises = friends.map((friendId) =>
      Notification.create({
        recipient: friendId,
        sender: userId,
        type: "account_deleted",
        message: `${user.username} has deleted their account.`,
      })
    );

    await Promise.all([
      ...notificationPromises,
      User.deleteOne({ _id: userId }),
      User.updateMany({ friends: userId }, { $pull: { friends: userId } }),
    ]);
    await SendMessageEmail(
      user.fullName,
      user.email,
      "Your account deletion request has been confirmed and the account is permanently deleted, You will no longer be able to log in to your account."
    );
    res.status(200).json({
      message: "Account permanently deleted and friends notified.",
    });
  } catch (error) {
    console.error("ConfirmDeleteAccount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const CancelOperations = async (req, res) => {
  try {
    const { code } = req.body;
    const { id } = req.params;
    const userId = req.user?._id;
    if (!id) {
      return res.status(400).json({ error: "User ID parameter is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid paramId:", id);
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!userId) {
      console.error("req.user._id is missing:", req.user);
      return res.status(401).json({ error: "User not authenticated" });
    }
    if (id !== userId.toString()) {
      console.error("ID mismatch - paramId:", id, "userId:", userId.toString());
      return res
        .status(403)
        .json({ error: "Unauthorized to cancel deletion for this account" });
    }
    if (!code) {
      return res.status(400).json({ error: "Verification code is required" });
    }

    const user = await User.findById(userId).select(
      "codeAuthentication codeAuthenticationExpires codeType fullName email"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.codeAuthentication || user.codeAuthentication !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    if (user.codeAuthenticationExpires < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }
    user.codeAuthentication = null;
    user.codeAuthenticationExpires = null;
    user.codeType = null;
    await user.save();
    res.status(200).json({
      message: "Your request has been successfully canceled.",
    });
  } catch (error) {
    console.error("CancelDeletion error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const DisableAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const codeAuthentication = generateAuthCode();
    const codeExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.codeAuthentication = codeAuthentication;
    user.codeAuthenticationExpires = codeExpiration;
    user.codeType = "disable_account";
    await user.save();

    await SendCodeEmail(
      user.fullName,
      user.email,
      codeAuthentication,
      "We recieved a request to disable your account , please use the code below to confirm this action."
    );

    res.status(200).json({
      message:
        "Verification email sent. Please check your email to confirm account disabling.",
      codeAuthentication,
      codeAuthenticationExpires: codeExpiration,
    });
  } catch (error) {
    console.error("DisableAccount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const ConfirmDisableAccount = async (req, res) => {
  try {
    const { code, password } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({ error: "Verification code is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.findById(userId).select(
      "codeAuthentication codeAuthenticationExpires codeType password fullName email deletionData"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    if (!user.codeAuthentication || user.codeAuthentication !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    if (user.codeAuthenticationExpires < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }
    if (user.codeType !== "disable_account") {
      return res
        .status(400)
        .json({ error: "Invalid code type for disabling account" });
    }

    user.deletionData = {
      Restorable: true,
      Disabled: true,
    };
    user.codeAuthentication = null;
    user.codeAuthenticationExpires = null;
    user.codeType = null;
    user.disabledAt = new Date();
    await user.save();

    await SendMessageEmail(
      user.fullName,
      user.email,
      "Your account has been successfully disabled. You can restore it anytime by logging in with your credentials."
    );

    res.status(200).json({
      message: "Account disabled successfully",
      deletionData: user.deletionData,
      disabledAt: user.disabledAt,
    });
  } catch (error) {
    console.error("ConfirmDisableAccount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const restoreAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    user.deletionData = {
      Restorable: false,
      Disabled: false,
    };
    user.disabledAt = null;
    await user.save();

    res.status(200).json({ message: "Account restored successfully", user });
  } catch (error) {
    console.error("RestoreAccount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UpdateUsername = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    if (!id) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const user = await User.findById(id);
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password" });
    }
    if (username.includes(" ")) {
      return res.status(400).json({ error: "Username cannot contain spaces" });
    }
    if (username.length >= 30) {
      return res
        .status(400)
        .json({ error: "Username must be less than 30 characters" });
    }
    if (username.toLowerCase() == user.username) {
      return res.status(400).json({ error: "No Changes occoured" });
    }
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(username)) {
      return res
        .status(400)
        .json({ error: "You cannot use email as username" });
    }
    if (username.length < 6) {
      return res
        .status(400)
        .json({ error: "Username must be more than 6 characters" });
    }
    if (username !== username.toLowerCase()) {
      return res.status(400).json({ error: "Username must be lowercase" });
    }
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    user.username = username;
    await user.save();

    res.status(200).json({ message: "Username updated successfully", user });
  } catch (error) {
    console.error("UpdateUsername error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UpdatePassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email, _id: req.user._id });
    if (!user)
      return res
        .status(404)
        .json({ error: "User not found or email does not match" });

    const codeAuth = generateAuthCode();
    const codeExpiration = new Date(Date.now() + 15 * 60 * 1000);
    user.codeAuthentication = codeAuth;
    user.codeAuthenticationExpires = codeExpiration;
    user.codeType = "change_password";
    await user.save();

    try {
      await sendEmail(
        user.fullName,
        user.email,
        codeAuth,
        "Change Password",
        `We received a request to change the password for your Let's Topic account.`,
        `${BaseUrl}/change-password`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }
    res.status(200).json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("UpdatePassword error:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const VerifyandChangePassword = async (req, res) => {
  const { password, newPassword, verificationCode } = req.body;
  try {
    if (!password)
      return res.status(400).json({ error: "Current password is required" });
    if (!newPassword)
      return res.status(400).json({ error: "New password is required" });
    if (!verificationCode)
      return res.status(400).json({ error: "Verification code is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      !user.codeAuthentication ||
      user.codeAuthentication !== verificationCode ||
      user.codeType !== "change_password"
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or incorrect verification code" });
    }
    if (user.codeAuthenticationExpires < new Date()) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ error: "Incorrect current password" });

    if (newPassword === password) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    const matchRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!matchRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be strong (at least 8 characters, including uppercase, lowercase, number, and special character)",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updateResult = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashedPassword,
          codeAuthentication: null,
          codeAuthenticationExpires: null,
          codeType: null,
        },
      },
      { new: true }
    );

    if (!updateResult) {
      console.error(`Failed to update user ${user._id}`);
      return res.status(500).json({ error: "Failed to update password" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const ForgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "If the email exists, a reset code has been sent" });
    }

    const codeAuth = generateAuthCode();
    const codeExpiration = new Date(Date.now() + 15 * 60 * 1000);
    user.codeAuthentication = codeAuth;
    user.codeAuthenticationExpires = codeExpiration;
    user.codeType = "reset_password";
    await user.save();

    try {
      await sendEmail(
        user.fullName,
        user.email,
        codeAuth,
        "Password Reset Request",
        `We received a request to reset the password for your Let's Topic account.`,
        `${BaseUrl}/reset-password`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }

    res
      .status(200)
      .json({ message: "If the email exists, a reset code has been sent" });
  } catch (error) {
    console.error("ForgetPassword error:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const VerifyandResetPassword = async (req, res) => {
  const { newPassword, verificationCode } = req.body;
  try {
    if (!newPassword)
      return res.status(400).json({ error: "New password is required" });
    if (!verificationCode)
      return res.status(400).json({ error: "Verification code is required" });

    const user = await User.findOne({
      codeAuthentication: verificationCode,
      codeType: "reset_password",
      codeAuthenticationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    const matchRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!matchRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be strong (at least 8 characters, including uppercase, lowercase, number, and special character)",
      });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updateResult = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashedPassword,
          codeAuthentication: null,
          codeAuthenticationExpires: null,
          codeType: null,
        },
      },
      { new: true }
    );

    if (!updateResult) {
      console.error(`Failed to update user ${user._id}`);
      return res.status(500).json({ error: "Failed to reset password" });
    }

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("VerifyandResetPassword error:", {
      message: error.message,
      stack: error.stack,
      code: verificationCode,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetLoggedDevices = async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;

  try {
    let userId;

    if (email) {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found." });
      userId = user._id;
    } else {
      userId = id;
    }

    return res.status(200).json({
      isMultipleDevices,
      deviceCount: uniqueDevices.size,
    });
  } catch (err) {
    console.error("Error detecting multiple devices:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const ReportUser = async (req, res) => {
  try {
    const { reportedEmail, reason, image } = req.body;
    const reporter = req.user?.id;

    if (!reporter) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!reportedEmail || !reason) {
      return res.status(400).json({
        success: false,
        message: "Reported user email and reason are required",
      });
    }

    const reportedUser = await User.findOne({ email: reportedEmail }).select(
      "username _id email"
    );
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: "Reported user not found",
      });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const report = await Report.create({
      reporter,
      reported: reportedUser._id,
      reason,
      image: imageUrl,
      reportId: uuidv4(),
    });

    await Notification.create({
      recipient: reporter,
      sender: reporter,
      type: "report_sent",
      message: `You reported ${reportedUser.username} for ${reason}`,
      requestId: report._id,
    });

    return res.status(201).json({
      success: true,
      data: report,
      message: "User reported successfully",
    });
  } catch (error) {
    console.error("Error reporting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while reporting user",
      error: error.message,
    });
  }
};
