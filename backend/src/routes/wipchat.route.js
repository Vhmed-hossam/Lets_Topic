import express from "express";

import { protectRoute } from "../middleware/authmiddleware.js";
import {
  acceptWipeChatRequest,
  declineWipeChatRequest,
  requestWipeChat,
} from "../controllers/wipechatcontroller.js";

const router = express.Router();

router.post("/request", protectRoute, requestWipeChat);
router.put("/accept/:requestId", protectRoute, acceptWipeChatRequest);
router.put("/decline/:requestId", protectRoute, declineWipeChatRequest);

export default router;
