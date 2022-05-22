// Importing the required modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import Models
const { User } = require("../models/user.model");

// Import Utils
const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/appError");
const { filterObj } = require("../utils/filterObj");

// Create a new user
exports.createNewUser = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  const salt = await bcrypt.genSalt(12);

  const passwordCrypt = await bcrypt.hash(password, salt);

  const passwordConfirmCrypt = await bcrypt.hash(passwordConfirm, salt);

  if (password !== passwordConfirm) {
    return next(new AppError(400, "Passwords don't match"));
  }

  const newUser = await User.create({
    username,
    email,
    password: passwordCrypt,
    passwordConfirm: passwordConfirmCrypt
  });

  newUser.password = undefined;

  newUser.passwordConfirm = undefined;

  res.status(201).json({
    status: "success",
    data: {
      newUser
    }
  });
});

// Login user
exports.loginUser = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError(400, "Enter a valid email and password"));
    }

    const user = await User.findOne({ where: { email, status: "active" } });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!user || !isPasswordValid) {
      return next(new AppError(400, "Credentials are invalid"));
    }

    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      status: "success",
      data: {
        token
      }
    });
  } catch (err) {
    return next(new AppError(400, "Credentials are invalid"));
  }
});

// Get all the users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    where: { status: "active" },
    attributes: { exclude: ["password", "passwordConfirm"] }
  });

  res.status(200).json({
    status: "success",
    data: users
  });
});

// Get user by Id
exports.getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    where: { status: "active", id },
    attributes: { exclude: ["password", "passwordConfirm"] }
  });

  if (!user) {
    return next(new AppError(404, "Cant find the user with the given ID"));
  }

  res.status(200).json({
    status: "success",
    data: user
  });
});

// Update user by Id
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  const data = filterObj(req.body, "username", "email", "role");

  await user.update({ ...data });

  res.status(204).json({
    status: "success"
  });
});

// Delete user by Id
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  // This is a soft delete technical
  await user.update({ status: "deleted" });

  res.status(204).json({
    status: "success"
  });
});
