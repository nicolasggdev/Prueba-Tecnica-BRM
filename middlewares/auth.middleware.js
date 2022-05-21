// Importing the required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { promisify } = require("util");

// Import Models
const { User } = require("../models/user.model");

// Import Utils
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

dotenv.config({ path: "./config.env" });

exports.validateSession = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError(401, "Invalid session"));
  }

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findOne({
    where: { id: decodedToken.id, status: "active" },
    attributes: {
      exclude: ["password"]
    }
  });

  if (!user) {
    return next(new AppError(401, "Invalid session"));
  }

  req.currentUser = user;

  next();
});

exports.protectAccountOwner = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { currentUser } = req;

  if (currentUser.id !== +id) {
    return next(new AppError(403, "You cant update others users accounts"));
  }

  next();
});
