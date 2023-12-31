const User = require("../models/userModel");
const { generateToken } = require("../config/jwtToken");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const { validateMongodbid } = require("../utils/validateMongodbid");

const { generateRefreshToken } = require("../config/refreshToken");

const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //Create a new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    //User already exists
    throw new Error("User already exists");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user already present
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?.id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 72 * 1000,
    });

    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid credentials");
  }
});
//get all users

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (e) {
    throw new Error("No Users found");
  }
});

//get a single user

const getASingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getUser = await User.findById(id);
    res.json(getUser);
  } catch (e) {
    throw new Error("No User found");
  }
});
//logout handler

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendstatus(204); // forbidden
  }
  await user.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendstatus(204); // forbidden
});

//handle Refresh Token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await findOne({ refreshToken });
  if (!user) throw new Error("No refresh token present in DB or not matched");
  jwt.validate(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id)
      throw new Error("there is something wrong with refresh token");
    const acessToken = generateToken(user?.id);
    res.json({ acessToken });
  });
  req.user = user;
});

//delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const deleteAUser = await User.findByIdAndDelete(id);
    res.json(deleteAUser);
  } catch (e) {
    throw new Error("User doesn't exist");
  }
});

//Update a user
const updateAUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongodbid(id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updateUser);
  } catch (e) {
    throw new Error("User doesn't exist");
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);

  try {
    const blockThisGuy = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );
    res.json({
      msg: "User blocked",
    });
  } catch (e) {
    throw new Error("User doesn't exist");
  }
});

const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);

  try {
    const unBlockThisGuy = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    res.json({ msg: "User unBlocked" });
  } catch (e) {
    throw new Error("User doesn't exist");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { password } = req.body;
  validateMongodbid(id);
  const user = await User.findById(id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne(email);
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href= 'http://localhost:5000/api/user/reset-Password/${token}'> Click Here </a>`;
    const data = {
      to : email,
      text :  `Heyyy User`,
      subject: "Forgot Password Link",
      htm : resetURL
    };
    sendEmail(data);
    res.json(token);
  } catch (err) {
    throw new Error(err);
  }
});

const resetPassword  = asyncHandler(async(req,res) => {
  const {password} = req.body;
  const {token} = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken:hashedToken,
    passwordResetExpires:{$gte : Date.now()},
  })
  if(!user) throw new Error('Token Expired, Please try again later.');
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
})

module.exports = {
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
};
