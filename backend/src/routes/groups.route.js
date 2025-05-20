// import express from "express";
// import {
//   AddDescription,
//   AddGroupSecurityKey,
//   CreateGroup,
//   DeleteGroup,
//   GiveAdminRole,
//   InviteUser,
//   JoinGroup,
//   LeaveGroup,
//   RemoveAdminRole,
//   RemoveDescription,
//   RemoveGroupSecurityKey,
//   RemoveUser,
//   UpdateGroupSecurityKey,
//   uploadGroupAvatar,
//   GetGroupMessages,
//   GetAllMembers,
//   DeleteMessage,
//   EditMessage
// } from "../controllers/groupcontroller";
// import { protectedRoute } from "../middleware/authmiddleware";
// const router = express.Router();

// router.post("/create", protectedRoute, CreateGroup);
// router.post("/:groupId/join", protectedRoute, JoinGroup);
// router.post("/:groupId/leave", protectedRoute, LeaveGroup);
// router.delete("/:groupId", protectedRoute,  DeleteGroup);
// router.post(
//   "/:groupId/avatar",
//   protectedRoute,
//
//   uploadGroupAvatar
// );
// router.post("/:groupId/invite", protectedRoute,  InviteUser);
// router.post("/:groupId/remove", protectedRoute,  RemoveUser);
// router.post(
//   "/:groupId/security-key",
//   protectedRoute,
//
//   AddGroupSecurityKey
// );
// router.delete(
//   "/:groupId/security-key",
//   protectedRoute,
//
//   RemoveGroupSecurityKey
// );
// router.put(
//   "/:groupId/security-key",
//   protectedRoute,
//
//   UpdateGroupSecurityKey
// );
// router.post(
//   "/:groupId/give-admin",
//   protectedRoute,
//
//   GiveAdminRole
// );
// router.post(
//   "/:groupId/remove-admin",
//   protectedRoute,
//
//   RemoveAdminRole
// );
// router.put(
//   "/:groupId/description",
//   protectedRoute,
//
//   AddDescription
// );
// router.delete(
//   "/:groupId/description",
//   protectedRoute,
//
//   RemoveDescription
// );
// router.get("/:groupId/messages", GetGroupMessages);

// router.get("/:groupId/members", GetAllMembers);

// router.delete(
//   "/:groupId/messages/:messageId",
//   protectedRoute,
//
//   DeleteMessage
// );
// router.put(
//   "/:groupId/messages/:messageId",
//   protectedRoute,
//
//   EditMessage
// );

// export default router;
