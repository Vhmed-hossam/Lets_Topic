import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  verifyToken,
  checkAuth,
  changeName,
  UploadBanner,
  AddBio,
  deleteAccount,
  restoreAccount,
  UpdatePassword,
  DisableAccount,
  verifyEmail,
  UpdateUsername,
  VerifyandChangePassword,
  ForgetPassword,
  VerifyandResetPassword,
  confirmDeleteAccount,
  CancelOperations,
  ConfirmDisableAccount,
  ReportUser,
} from "../controllers/authcontroller.js";
import { protectRoute } from "../middleware/authmiddleware.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get("/verify-token", protectRoute, verifyToken);

router.get("/check-auth", protectRoute, checkAuth);

router.put("/delete-account/:id", protectRoute, deleteAccount);

router.put("/disable-account", protectRoute, DisableAccount);

router.put("/restore-account", restoreAccount);

router.post("/verify-email", verifyEmail);

router.post("/update-password", protectRoute, UpdatePassword);

router.put("/verifyandchangepassword", protectRoute, VerifyandChangePassword);

router.post("/forget-password", ForgetPassword);

router.put("/ver-reset-password", VerifyandResetPassword);

router.put("/confirm-delete-account", protectRoute, confirmDeleteAccount);

router.put("/cancel-operation/:id", protectRoute, CancelOperations);

router.put("/confirm-disable-account", protectRoute, ConfirmDisableAccount);

router.post("/report-user", protectRoute, ReportUser);

// Customization --------

router.put("/change-name/:id", protectRoute, changeName);

router.put("/update-profile", protectRoute, updateProfile);

router.put("/upload-banner", protectRoute, UploadBanner);

router.post("/add-bio/:id", protectRoute, AddBio);

router.put("/update-username/:id", protectRoute, UpdateUsername);

export default router;
