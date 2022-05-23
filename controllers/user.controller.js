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
/**
 * @api {post} https://prueba-tecnica-brm.herokuapp.com/api/v1/users/signup 1. Create New User
 * @apiName createNewUser
 * @apiGroup User
 * @apiPermission none
 *
 * @apiBody {String} role The default user role is client.
 * @apiBody {String} status The default user status is active.
 * @apiBody {String} id The user id.
 * @apiBody {String} username The username.
 * @apiBody {String} email The user email.
 * @apiBody {String} updatedAt The update date of the User.
 * @apiBody {String} createdAt The user's creation date.
 *
 * @apiSuccess {String} role The default user role is client.
 * @apiSuccess {String} status The default user status is active.
 * @apiSuccess {Number} id The user id.
 * @apiSuccess {String} username The username.
 * @apiSuccess {String} email The user email.
 * @apiSuccess {String} updatedAt The update date of the User.
 * @apiSuccess {String} createdAt The user's creation date.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "role": "client",
 *   "status": "active",
 *   "id": 3,
 *   "username": "juan",
 *   "email": "juan@gmail.com",
 *   "updatedAt": "2022-05-23T01:46:11.698Z",
 *   "createdAt": "2022-05-23T01:46:11.698Z"
 * }
 *
 * @apiError DifferentsPasswords The password and passwordConfirm don't match
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "Passwords don't match"
 * }
 */
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
/**
 * @api {post} https://prueba-tecnica-brm.herokuapp.com/api/v1/users/login 2. Login User
 * @apiName LoginUser
 * @apiGroup User
 * @apiPermission none
 *
 * @apiBody {String} email email of the User.
 * @apiBody {String} password password of the User.
 *
 * @apiSuccess {String} token The user token (There are two users - admin and client).
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjUzMjcwNTM2LCJleHAiOjE2NTMzNTY5MzZ9.u0-SMmQp0t0FgRY6J3T2u_XVI7_A3tDNWKLmLy44Dwo"
 * }
 *
 * @apiError EmailAndPassword1 The email or password are empty
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "Enter a valid email and password"
 * }
 *
 * @apiError EmailAndPassword2 The email or password are wrong
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "Credentials are invalid"
 * }
 */
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
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/users 3. Get all User
 * @apiName GetAllUsers
 * @apiGroup User
 * @apiPermission none
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiSuccess {Array} users Get all the users.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "id": 1,
 *     "username": "viviana",
 *     "email": "viviana@gmail.com",
 *     "role": "client",
 *     "status": "active",
 *     "createdAt": "2022-05-22T23:11:04.236Z",
 *     "updatedAt": "2022-05-22T23:11:04.236Z"
 *   },
 *   {
 *     "id": 2,
 *     "username": "nicolas",
 *     "email": "nicolas@gmail.com",
 *     "role": "admin",
 *     "status": "active",
 *     "createdAt": "2022-05-22T23:11:23.021Z",
 *     "updatedAt": "2022-05-22T23:13:14.403Z"
 *   }
 * ]
 */
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
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/users/:id 4. Get user by id
 * @apiName GetUserById
 * @apiGroup User
 * @apiPermission none
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id Owner id
 *
 * @apiSuccess {Object} user Get user by id.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": 1,
 *   "username": "viviana",
 *   "email": "viviana@gmail.com",
 *   "role": "client",
 *   "status": "active",
 *   "createdAt": "2022-05-22T23:11:04.236Z",
 *   "updatedAt": "2022-05-22T23:11:04.236Z"
 * }
 *
 * @apiError User Can't find the user with the given ID
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "Can't find the user with the given ID"
 * }
 */
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
/**
 * @api {patch} https://prueba-tecnica-brm.herokuapp.com/api/v1/users/:id 5. Update user by id
 * @apiName UpdateUserById
 * @apiGroup User
 * @apiPermission UserOwner
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id Owner id
 *
 * @apiBody {String} username The username.
 * @apiBody {String} email The user email.
 * @apiBody {String} role The user role (There are two options - admin or client).
 *
 * @apiSuccess {String} status Success.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 * {
 *   "status": "success"
 * }
 *
 * @apiError User Can't find the user with the given ID
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "Can't find the user with the given ID"
 * }
 *
 * @apiError User You cant update others users accounts
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "You cant update others users accounts"
 * }
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  const data = filterObj(req.body, "username", "email", "role");

  await user.update({ ...data });

  res.status(204).json({
    status: "success"
  });
});

// Delete user by Id
/**
 * @api {delete} https://prueba-tecnica-brm.herokuapp.com/api/v1/users/:id 6. Delete user by id
 * @apiName DeleteUserById
 * @apiGroup User
 * @apiPermission UserOwner
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id Owner id
 *
 * @apiSuccess {String} status Success.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 * {
 *   "status": "success"
 * }
 *
 * @apiError User Can't find the user with the given ID
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "Can't find the user with the given ID"
 * }
 *
 * @apiError User You cant update others users accounts
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "You cant update others users accounts"
 * }
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  // This is a soft delete technical
  await user.update({ status: "deleted" });

  res.status(204).json({
    status: "success"
  });
});
