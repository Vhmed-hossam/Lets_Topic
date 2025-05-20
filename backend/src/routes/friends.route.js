import express from "express";

import { protectRoute } from "../middleware/authmiddleware.js";
import {
  acceptFriendRequest,
  sendFriendRequest,
  refuseFriendRequest,
  blockUser,
  unfriendUser,
  unblockUser,
  getFriendsList,
  getBlockedUsers,
  getUserNotifications,
  clearNotifications,
  deleteNotification,
} from "../controllers/friendscontroller.js";

const router = express.Router();

router.post("/send-friend-request", protectRoute, sendFriendRequest);
router.post(
  "/accept-friend-request/:requestId",
  protectRoute,
  acceptFriendRequest
);
router.post(
  "/refuse-friend-request/:requestId",
  protectRoute,
  refuseFriendRequest
);
router.post("/block-user", protectRoute, blockUser);
router.post("/unfriend-user", protectRoute, unfriendUser);
router.post("/unblock-user", protectRoute, unblockUser);
router.get("/friends-list/:userId", protectRoute, getFriendsList);
router.get("/blocked-users/:userId", protectRoute, getBlockedUsers);

router.get("/notifications/:userId", protectRoute, getUserNotifications);
router.delete(
  "/notifications/clear-notifications/:userId",
  protectRoute,
  clearNotifications
);
router.delete(
  "/notifications/delete-notification/:userId",
  protectRoute,
  deleteNotification
);

export default router;