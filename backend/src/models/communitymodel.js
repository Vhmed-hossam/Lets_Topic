// import mongoose from "mongoose";

// const communitySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   groupAvatar: {
//     type: String,
//   },
//   members: [
//     {
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       role: {
//         type: String,
//         enum: ["owner", "admin", "member"],
//         default: "member",
//       },
//     },
//   ],
//   channels: [
//     {
//       name: {
//         type: String,
//         required: true,
//       },
//       createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//       },
//     },
//   ],
//   community: {
//     type: Boolean,
//     default: true,
//   },
//   isPrivate: {
//     type: Boolean,
//     default: false,
//   },
//   description: {
//     type: String,
//   },
//   securityKey: {
//     type: String,
//   },
//   lastMessage: {
//     type: String,
//   },
// });

// communitySchema.methods.isOwner = function (userId) {
//   return this.createdBy.toString() === userId;
// };

// communitySchema.methods.isAdmin = function (userId) {
//   return this.members.some(
//     (member) => member.user.toString() === userId && member.role === "admin"
//   );
// };

// export default mongoose.model("Community", communitySchema);
