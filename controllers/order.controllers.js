// Import Models
const { Cart } = require("../models/cart.model");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");
const { User } = require("../models/user.model");

// Import Utils
const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/appError");

// Get all the orders
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

  res.status(200).json({
    status: "success",
    data: {
      order
    }
  });
});

// Get all own orders
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
exports.getOwnOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

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

  res.status(200).json({
    status: "success",
    data: {
      order
    }
  });
});
