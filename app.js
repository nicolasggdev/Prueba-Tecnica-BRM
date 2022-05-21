// Importing the required modules
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// Import Utils
const { globalErrorHandler } = require("./middlewares/error.middleware");
const { AppError } = require("./utils/appError");

// Import Router
const { userRouter } = require("./routes/user.routes");

const app = express();

app.use(express.json());

app.use(cors());

app.use(helmet());

app.use(compression());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// This is used to control the number of request to the API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message:
    "Too many accounts created from this IP, please try again after an hour"
});

app.use(limiter);

app.use("/api/v1/users", userRouter);

// Middleware for page that not found
app.use("*", (req, res, next) => {
  next(new AppError(404, `${req.originalUrl} not found in this server.`));
});

app.use(globalErrorHandler);

module.exports = { app }; // exporting the app to use in the server.js file
