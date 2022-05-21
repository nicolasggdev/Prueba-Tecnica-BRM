// Importing the required modules
const express = require("express");
const router = express.Router();

// Import Controllers
const {
  createNewUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/user.controller");

// Import Middlewares
const {
  createUserValidators,
  validationResults
} = require("../middlewares/validators.middleware");
const {
  validateSession,
  protectAccountOwner
} = require("../middlewares/auth.middleware");

// Routes
router.post("/signup", createUserValidators, validationResults, createNewUser);

router.post("/login", loginUser);

router.use(validateSession);

router.get("/", getAllUsers);

router
  .route("/:id")
  .get(getUserById)
  .patch(protectAccountOwner, updateUser)
  .delete(protectAccountOwner, deleteUser);

module.exports = { userRouter: router };
