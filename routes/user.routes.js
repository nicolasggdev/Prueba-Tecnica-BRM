const express = require("express");

const router = express.Router();

const { createNewUser, loginUser } = require("../controllers/user.controller");

router.post("/signup", createNewUser);

router.post("/login", loginUser);

module.exports = { userRouter: router };
