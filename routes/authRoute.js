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
} = require("../controller/userCtrl");
const {authMiddleware , isAdmin} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-users", getAllUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id",authMiddleware, isAdmin, getASingleUser);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleware, updateAUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);

module.exports = router;
