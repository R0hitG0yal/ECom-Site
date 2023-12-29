const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer ")) {
    token = req?.headers?.authorization?.split(" ")[1];
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decode?.id);
      req.user = user;
      next();
    } catch (e) {
      throw new Error("Not authorized token expired, Please log in again.");
    }
  } else {
    throw new Error("There is no token attatched to request");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req?.user;
  const adminUser = await User.findOne({ email });
  if (adminUser?.role !== "Admin") {
    throw new Error("You are not an Admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
