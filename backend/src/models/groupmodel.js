// import mongoose from "mongoose";

// const GroupSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   members: [
//     {
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//       },
//       role: {
//         type: String,
//         enum: ["owner", "admin", "member"],
//         default: "member",
//       },
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   groupAvatar: {
//     type: String,
//     default: "",
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   description: {
//     type: String,
//     default: "",
//   },
//   lastMessage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Message",
//   },
// });

// const Group = mongoose.model("Group", GroupSchema);

// export default Group;
