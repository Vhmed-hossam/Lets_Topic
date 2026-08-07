// import FeedBack from "../models/feedbackmodel.js";
// import Notification from "../models/notificationmodel.js";

// export const SubmitFeedback = async (req, res) => {
//   const { message, rating, userId } = req.body;
//   if (!userId) {
//     return res.status(400).json({ error: "User ID is required" });
//   }
//   if (!message) {
//     return res.status(400).json({ error: "Message is required" });
//   }
//   if (message.length < 6) {
//     return res
//       .status(400)
//       .json({ error: "Message must be at least 6 characters long" });
//   }
//   if (!rating) {
//     return res.status(400).json({ error: "Rating is required" });
//   }

//   if (rating < 1 || rating > 5) {
//     return res.status(400).json({ error: "Rating must be between 1 and 5" });
//   }
//   try {
//     const newFeedback = new FeedBack({
//       sender: userId,
//       message,
//       rating,
//     });
//     await newFeedback.save();
//     res.status(201).json({ message: "Feedback submitted successfully" });
//     const notification = new Notification({
//       user: userId,
//       type: "feedback",
//       message: "Feedback submitted successfully",
//     });
//     await notification.save();
//     res.status(200).json({
//       success: true,
//       message: "Feedback submitted successfully",
//     });
//   } catch (error) {
//     console.error("Feedback submission error:", error);
//     res.status(500).json({
//       message: "Server error submitting feedback",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
