// Import Models
const { Product } = require("../models/product.model");

// Import Utils
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const { filterObj } = require("../utils/filterObj");

// Create new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const { batchNumber, name, price, quantityAvailable } = req.body;

  const { id } = req.currentUser;

  const newProduct = await Product.create({
    batchNumber,
    name,
    price,
    quantityAvailable,
    userId: id
  });

  res.status(201).json({
    status: "success",
    data: {
      newProduct
    }
  });
});

// Get all the products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({ where: { status: "active" } });

  res.status(200).json({
    status: "success",
    data: {
      products
    }
  });
});

// Get product by Id
exports.productById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ where: { status: "active", id } });

  if (!product) {
    return next(new AppError(404, "No product found"));
  }

  res.status(200).json({
    status: "success",
    data: {
      product
    }
  });
});

// Update product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ where: { status: "active", id } });

  if (!product) {
    return next(new AppError(404, "No product found"));
  }

  const data = filterObj(
    req.body,
    "batchNumber",
    "name",
    "price",
    "quantityAvailable"
  );

  await product.update({ ...data });

  res.status(204).json({
    status: "success"
  });
});

// Delete product by Id
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ where: { status: "active", id } });

  if (!product) {
    return next(new AppError(404, "No product found"));
  }

  // This is a soft delete technical
  await product.update({ status: "deleted" });

  res.status(204).json({
    status: "success"
  });
});
