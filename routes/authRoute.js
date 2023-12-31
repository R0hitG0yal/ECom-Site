const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getAllUser,
  getASingleUser,
  deleteUser,
  updateAUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
} = require("../controller/userCtrl");
const {authMiddleware , isAdmin} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/forgot-Password-Token",forgotPasswordToken);
router.put("/password",authMiddleware, updatePassword);
router.put("/reset-password:token",resetPassword);

router.post("/login", loginUserCtrl);
router.get("/all-users", getAllUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id",authMiddleware, isAdmin, getASingleUser);
router.delete("/:id", deleteUser);

router.put("/edit-user", authMiddleware, updateAUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);


module.exports = router;
