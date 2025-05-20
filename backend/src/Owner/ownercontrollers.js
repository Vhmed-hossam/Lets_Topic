import User from "../models/userModel.js";
import BannedUser from "./bannedModel.js";
import dotenv from "dotenv";
import SendMessageEmail from "../tasks/SendMessageEmail.js";
import Report from "../models/ReportModel.js";

dotenv.config();

export const validateOwnerKey = (req, res, next) => {
  const ownerKey = req.headers["owner-request-key"];

  if (!ownerKey || ownerKey === "") {
    return res.status(403).json({ error: "Owner request key is required" });
  }

  if (ownerKey !== process.env.OWNER_REQUEST_KEY) {
    return res.status(403).json({ error: "Incorrect owner request key" });
  }

  next();
};

const formatWithIndex = (items, type = "user") => {
  return items.map((item, index) => ({
    [`${type}Index`]: index + 1,
    ...item.toObject(),
  }));
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
    console.error(`Error fetching user by ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    const users = await User.find().select("-password");
    const usersWithIndex = formatWithIndex(users, "user");

    res.status(200).json({ count, users: usersWithIndex });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("email fullName");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await BannedUser.create({
      email: user.email,
      fullName: user.fullName,
    });

    await User.findByIdAndDelete(id);

    await SendMessageEmail(
      user.fullName,
      user.email,
      "Your account has been banned by admin for suspicious activity. Please contact admin for more details."
    );

    res.status(200).json({ message: "User has been permanently deleted" });
  } catch (error) {
    console.error(`Error banning user ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to ban user" });
  }
};

export const getBannedUsers = async (req, res) => {
  try {
    const count = await BannedUser.countDocuments();
    const bannedUsers = await BannedUser.find();
    const bannedUsersWithIndex = formatWithIndex(bannedUsers, "bannedUser");

    res.status(200).json({ count, users: bannedUsersWithIndex });
  } catch (error) {
    console.error("Error fetching banned users:", error);
    res.status(500).json({ error: "Failed to fetch banned users" });
  }
};

export const getBannedEmails = async (req, res) => {
  try {
    const bannedUsers = await BannedUser.find().select("email").lean();
    const emailList = bannedUsers.map((user) => user.email);

    res.status(200).json({ count: emailList.length, emails: emailList });
  } catch (error) {
    console.error("Error fetching banned emails:", error);
    res.status(500).json({ error: "Failed to fetch banned emails" });
  }
};

export const GetReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "username email _id")
      .populate("reported", "username email _id")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reports,
      message: "Reports retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reports",
      error: error.message,
    });
  }
};

export const GetOneReport = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: "Report ID is required" });
    }
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Error fetching report:", error);
  }
};
