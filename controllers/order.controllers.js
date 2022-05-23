// Import Models
const { Cart } = require("../models/cart.model");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");
const { User } = require("../models/user.model");

// Import Utils
const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/appError");

// Get all the orders
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/orders/ 1. Get all orders
 * @apiName GetAllOrders
 * @apiGroup Order
 * @apiPermission admin
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiSuccess {Array} orders Get all the orders
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * [
 *   {
 *     "id": 1,
 *     "userId": 2,
 *     "cartId": 1,
 *     "issuedAt": "Mon May 23 2022 03:12:04 GMT+0000 (Coordinated Universal Time)",
 *     "totalPrice": 1000000,
 *     "status": "active",
 *     "createdAt": "2022-05-23T03:12:04.529Z",
 *     "updatedAt": "2022-05-23T03:12:04.529Z",
 *     "cart": [Array with details]
 *     "user": [Array with details]
 *   },
 *   {
 *     "id": 1,
 *     "userId": 2,
 *     "cartId": 1,
 *     "issuedAt": "Mon May 23 2022 03:12:04 GMT+0000 (Coordinated Universal Time)",
 *     "totalPrice": 1000000,
 *     "status": "active",
 *     "createdAt": "2022-05-23T03:12:04.529Z",
 *     "updatedAt": "2022-05-23T03:12:04.529Z",
 *     "cart": [Array with details]
 *     "user": [Array with details]
 *   },
 * ]
 *
 * @apiError Order Protect Admin
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "Access denied"
 * }
 */
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    include: [
      {
        model: Cart,
        include: [
          { model: Product, through: { where: { status: "purchased" } } }
        ]
      },
      { model: User, attributes: { exclude: ["password", "passwordConfirm"] } }
    ]
  });

  res.status(200).json({
    status: "success",
    data: {
      orders
    }
  });
});

// Get order by id
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/orders/:id 2. Get order by id
 * @apiName GetOrderById
 * @apiGroup Order
 * @apiPermission admin
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id Order id
 *
 * @apiSuccess {Object} orders Get order by id
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * {
 *   "id": 1,
 *   "userId": 2,
 *   "cartId": 1,
 *   "issuedAt": "Mon May 23 2022 03:12:04 GMT+0000 (Coordinated Universal Time)",
 *   "totalPrice": 1000000,
 *   "status": "active",
 *   "createdAt": "2022-05-23T03:12:04.529Z",
 *   "updatedAt": "2022-05-23T03:12:04.529Z",
 *   "cart": [Array with details]
 *   "user": [Array with details]
 * }
 *
 * @apiError ORder No order found with that Id
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "No order found with that Id"
 * }
 *
 * @apiError Order Protect Admin
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "Access denied"
 * }
 */
exports.getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: { status: "active", id },
    include: [
      {
        model: Cart,
        include: [
          { model: Product, through: { where: { status: "purchased" } } }
        ]
      },
      { model: User, attributes: { exclude: ["password", "passwordConfirm"] } }
    ]
  });

  if (!order) {
    return next(new AppError(404, "No order found with that Id"));
  }

  res.status(200).json({
    status: "success",
    data: {
      order
    }
  });
});

// Get all own orders
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/orders/get-all-own-orders 3. Get all own orders
 * @apiName GetAllOwnOrders
 * @apiGroup Order
 * @apiPermission UserOwner
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiSuccess {Array} orders Get all the own orders
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * [
 *   {
 *     "id": 1,
 *     "userId": 2,
 *     "cartId": 1,
 *     "issuedAt": "Mon May 23 2022 03:12:04 GMT+0000 (Coordinated Universal Time)",
 *     "totalPrice": 1000000,
 *     "status": "active",
 *     "createdAt": "2022-05-23T03:12:04.529Z",
 *     "updatedAt": "2022-05-23T03:12:04.529Z",
 *     "cart": [Array with details]
 *   },
 *   {
 *     "id": 1,
 *     "userId": 2,
 *     "cartId": 1,
 *     "issuedAt": "Mon May 23 2022 03:12:04 GMT+0000 (Coordinated Universal Time)",
 *     "totalPrice": 1000000,
 *     "status": "active",
 *     "createdAt": "2022-05-23T03:12:04.529Z",
 *     "updatedAt": "2022-05-23T03:12:04.529Z",
 *     "cart": [Array with details]
 *   },
 * ]
 */
exports.getAllOwnOrders = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const orders = await Order.findAll({
    where: { userId: currentUser.id },
    include: [
      {
        model: Cart,
        include: [
          { model: Product, through: { where: { status: "purchased" } } }
        ]
      }
    ]
  });

  res.status(200).json({
    status: "success",
    data: {
      orders
    }
  });
});

// Get all own orders by id
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/orders/:id 4. Get own order by id
 * @apiName GetOwnOrderById
 * @apiGroup Order
 * @apiPermission UserOwner
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id Order id
 *
 * @apiSuccess {Object} orders Get order by id
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * {
 *   "id": 1,
 *   "userId": 2,
 *   "cartId": 1,
 *   "issuedAt": "Mon May 23 2022 03:12:04 GMT+0000 (Coordinated Universal Time)",
 *   "totalPrice": 1000000,
 *   "status": "active",
 *   "createdAt": "2022-05-23T03:12:04.529Z",
 *   "updatedAt": "2022-05-23T03:12:04.529Z",
 *   "cart": [Array with details]
 * }
 *
 * @apiError Order No order found with that Id
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "No order found with that Id"
 * }
 *
 * @apiError Order You can't see other users' purchases
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "You can't see other users' purchases"
 * }
 */
exports.getOwnOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { currentUser } = req;

  const order = await Order.findOne({
    where: { id },
    include: [
      {
        model: Cart,
        include: [
          { model: Product, through: { where: { status: "purchased" } } }
        ]
      }
    ]
  });

  if (!order) {
    return next(new AppError(404, "No order found with that id"));
  }

  if (currentUser.id !== order.userId) {
    return next(new AppError(403, "You can't see other users' purchases"));
  }

  res.status(200).json({
    status: "success",
    data: {
      order
    }
  });
});
