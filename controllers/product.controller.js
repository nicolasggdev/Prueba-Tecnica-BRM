// Import Models
const { Product } = require("../models/product.model");

// Import Utils
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const { filterObj } = require("../utils/filterObj");

// Create new product
/**
 * @api {post} https://prueba-tecnica-brm.herokuapp.com/api/v1/products/create-product 1. Create New Product
 * @apiName CreateNewProduct
 * @apiGroup Product
 * @apiPermission admin
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiBody {Number} batchNumber The batch number of the product.
 * @apiBody {String} name The product's name.
 * @apiBody {Number} price The product's price.
 * @apiBody {Number} quantityAvailable The product's quantity available.
 *
 * @apiSuccess {String} status The default product status is active.
 * @apiSuccess {Number} id The product id.
 * @apiSuccess {Number} batchNumber The batch number of the product.
 * @apiSuccess {String} name The product's name.
 * @apiSuccess {Number} price The product's price.
 * @apiSuccess {Number} quantityAvailable The product's quantity available.
 * @apiSuccess {Number} userId The seller user (this case is always the admin).
 * @apiSuccess {String} updatedAt The update date of the product.
 * @apiSuccess {String} createdAt The product's creation date.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * {
 *   "status": "active",
 *   "id": 1,
 *   "batchNumber": 1,
 *   "name": "Tv Sony",
 *   "price": 1000000,
 *   "quantityAvailable": 10,
 *   "userId": 2,
 *   "updatedAt": "2022-05-23T02:44:23.359Z",
 *   "createdAt": "2022-05-23T02:44:23.359Z"
 * }
 *
 * @apiError Product Protect Admin
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "Access denied"
 * }
 */
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
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/products 2. Get all Products
 * @apiName GetAllProducts
 * @apiGroup Product
 * @apiPermission admin
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiSuccess {Array} products Get all the products.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "id": 1,
 *     "batchNumber": 1,
 *     "name": "Tv Sony",
 *     "price": 1000000,
 *     "quantityAvailable": 10,
 *     "userId": 1,
 *     "status": "active",
 *     "createdAt": "2022-05-23T02:44:23.359Z",
 *     "updatedAt": "2022-05-23T02:44:23.359Z"
 *   },
 *   {
 *     "id": 1,
 *     "batchNumber": 2,
 *     "name": "Tv Samsung",
 *     "price": 1200000,
 *     "quantityAvailable": 15,
 *     "userId": 1,
 *     "status": "active",
 *     "createdAt": "2022-05-23T02:44:23.359Z",
 *     "updatedAt": "2022-05-23T02:44:23.359Z"
 *   }
 * ]
 *
 * @apiError Product Protect Admin
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "Access denied"
 * }
 */
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
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/products/:id 3. Get product by id
 * @apiName GetProductById
 * @apiGroup Product
 * @apiPermission admin
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id Product id
 *
 * @apiSuccess {Object} user Get product by id.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": 1,
 *   "batchNumber": 2,
 *   "name": "Tv Samsung",
 *   "price": 1200000,
 *   "quantityAvailable": 15,
 *   "userId": 1,
 *   "status": "active",
 *   "createdAt": "2022-05-23T02:44:23.359Z",
 *   "updatedAt": "2022-05-23T02:44:23.359Z"
 * }
 *
 * @apiError Product No product found
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "No product found"
 * }
 *
 * @apiError Product Protect Admin
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "Access denied"
 * }
 */
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
/**
 * @api {patch} https://prueba-tecnica-brm.herokuapp.com/api/v1/products/update-product/:id 4. Update product by id
 * @apiName UpdateProductById
 * @apiGroup Product
 * @apiPermission admin
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id Product id
 *
 * @apiBody {Number} batchNumber The batch number of the product.
 * @apiBody {String} name The product's name.
 * @apiBody {Number} price The product's price.
 * @apiBody {Number} quantityAvailable The product's quantity available.
 *
 * @apiSuccess {String} status Success.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 * {
 *   "status": "success"
 * }
 *
 * @apiError Product No product found
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "No product found"
 * }
 *
 * @apiError Product Protect Admin
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "Access denied"
 * }
 */
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
/**
 * @api {delete} https://prueba-tecnica-brm.herokuapp.com/api/v1/products/delete-product/:id 5. Delete product by id
 * @apiName DeleteProductById
 * @apiGroup Product
 * @apiPermission admin
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiParam {Number} id product id
 *
 * @apiSuccess {String} status Success.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 * {
 *   "status": "success"
 * }
 *
 * @apiError Product No product found
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "No product found"
 * }
 *
 * @apiError Product Protect Admin
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 403 Not Found
 * {
 *   error: "Access denied"
 * }
 */
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
