import express from "express";

import {
  getUserById,
  getAllUsers,
  banUser,
  getBannedUsers,
  getBannedEmails,
  validateOwnerKey,
  GetReports,GetOneReport
} from "./ownercontrollers.js";
const router = express.Router();

router.get("/users/:id", validateOwnerKey, getUserById);

router.get("/users", validateOwnerKey, getAllUsers);

router.delete("/users/:id/ban", validateOwnerKey, banUser);

router.get("/users/banned", validateOwnerKey, getBannedUsers);

router.get("/users/banned/emails", validateOwnerKey, getBannedEmails);

router.get("/reports", validateOwnerKey, GetReports);

router.get("/reports/:id", validateOwnerKey, GetOneReport);

export default router;
