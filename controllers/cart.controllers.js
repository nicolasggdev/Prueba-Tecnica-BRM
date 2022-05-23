// Import Models
const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");
const { ProductInCart } = require("../models/productsInCart.model");
const { Order } = require("../models/order.model");
const { User } = require("../models/user.model");

// Import Utils
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

// Get all users cart
/**
 * @api {get} https://prueba-tecnica-brm.herokuapp.com/api/v1/cart 1. Get user cart
 * @apiName GetUserCart
 * @apiGroup Cart
 * @apiPermission none
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiSuccess {Object} users Get all the users.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": 2,
 *   "userId": 2,
 *   "status": "active",
 *   "createdAt": "2022-05-23T03:39:19.649Z",
 *   "updatedAt": "2022-05-23T03:39:19.649Z",
 *   "products": [product with details]
 * }
 *
 * @apiError Cart Can't find the user with the given ID
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "This user does not have a cart yet"
 * }
 */
exports.getUserCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const cart = await Cart.findOne({
    where: { status: "active", userId: currentUser.id },
    include: [
      {
        model: Product,
        through: { where: { status: "active" } }
      }
    ]
  });

  if (!cart) {
    return next(new AppError(404, "This user does not have a cart yet"));
  }

  res.status(200).json({
    status: "success",
    data: {
      cart
    }
  });
});

// Add products to cart
/**
 * @api {post} https://prueba-tecnica-brm.herokuapp.com/api/v1/cart/add-product 2. Add product to cart
 * @apiName AddProductToCart
 * @apiGroup Cart
 * @apiPermission none
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiBody {Number} productId The unique id of each product
 * @apiBody {Number} quantity The quantity to buy
 *
 * @apiSuccess {String} status The default user status is active.
 * @apiSuccess {Number} id The cart id.
 * @apiSuccess {Number} productId The product id.
 * @apiSuccess {Number} cartId The cart id.
 * @apiSuccess {Number} quantity The quantity to buy
 * @apiSuccess {String} updatedAt The update date of the cart.
 * @apiSuccess {String} createdAt The cart's creation date.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "status": "active",
 *   "id": 2,
 *   "productId": 1,
 *   "cartId": 2,
 *   "quantity": 1,
 *   "updatedAt": "2022-05-23T03:39:19.653Z",
 *   "createdAt": "2022-05-23T03:39:19.653Z"
 * }
 *
 * @apiError ProductDoesntExist Cant find the product with the given ID
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "Cant find the product with the given ID"
 * }
 *
 * @apiError QuantityNotAvailable This product only has ${product.quantityAvailable} items.
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "This product only has ${product.quantityAvailable} items."
 * }
 *
 * @apiError ProductExistInCart This product is already in the cart
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "This product is already in the cart"
 * }
 */
exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId, quantity } = req.body;

  const product = await Product.findOne({
    where: { status: "active", id: productId }
  });

  if (!product) {
    return next(new AppError(404, "Cant find the product with the given ID"));
  }

  if (quantity > product.quantityAvailable) {
    return next(
      new AppError(
        400,
        `This product only has ${product.quantityAvailable} items.`
      )
    );
  }

  const cart = await Cart.findOne({
    where: {
      status: "active",
      userId: currentUser.id
    }
  });

  let addNewProduct;

  if (!cart) {
    const newCart = await Cart.create({ userId: currentUser.id });

    addNewProduct = await ProductInCart.create({
      productId,
      cartId: newCart.id,
      quantity
    });
  } else {
    const productExists = await ProductInCart.findOne({
      where: { cartId: cart.id, productId }
    });

    if (productExists && productExists.status === "active") {
      return next(new AppError(400, "This product is already in the cart"));
    }

    if (productExists && productExists.status === "removed") {
      addNewProduct = await productExists.update({
        status: "active",
        quantity
      });
    }

    if (!productExists) {
      addNewProduct = await ProductInCart.create({
        cartId: cart.id,
        productId,
        quantity
      });
    }
  }

  res.status(201).json({
    status: "success",
    data: {
      addNewProduct
    }
  });
});

// Update cart
/**
 * @api {patch} https://prueba-tecnica-brm.herokuapp.com/api/v1/cart/update-product 3. Update products in Cart
 * @apiName UpdateCart
 * @apiGroup Cart
 * @apiPermission none
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiBody {Number} productId The unique id of each product
 * @apiBody {Number} quantity The quantity to buy
 *
 * @apiSuccess {String} status Success.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 * {
 *   "status": "success"
 * }
 *
 * @apiError ProductDoesntExist Cant find the product with the given ID
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "Cant find the product with the given ID"
 * }
 *
 * @apiError QuantityNotAvailable This product only has ${product.quantityAvailable} items.
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "This product only has ${product.quantityAvailable} items."
 * }
 *
 * @apiError Cart This user does not have a cart yet
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "This user does not have a cart yet"
 * }
 *
 * @apiError ProductIsNotInCart Can't update product, is not in the cart yet
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "Can't update product, is not in the cart yet"
 * }
 */
exports.updateCartProduct = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const { productId, quantity } = req.body;

  const product = await Product.findOne({
    where: { status: "active", id: productId }
  });

  if (!product) {
    return next(new AppError(404, "Cant find the product with the given ID"));
  }

  if (quantity > product.quantityAvailable) {
    return next(
      new AppError(
        400,
        `This product only has ${product.quantityAvailable} items`
      )
    );
  }

  const cart = await Cart.findOne({
    where: { status: "active", userId: currentUser.id }
  });

  if (!cart) {
    return next(new AppError(400, "This user does not have a cart yet"));
  }

  const productInCart = await ProductInCart.findOne({
    where: { status: "active", cartId: cart.id, productId }
  });

  if (!productInCart) {
    return next(
      new AppError(404, `Can't update product, is not in the cart yet`)
    );
  }

  if (quantity === 0) {
    await productInCart.update({ quantity: 0, status: "removed" });
  }

  if (quantity > 0) {
    await productInCart.update({ quantity });
  }

  res.status(204).json({
    status: "success"
  });
});

// Remove products
/**
 * @api {delete} https://prueba-tecnica-brm.herokuapp.com/api/v1/cart/:id 4. Delete products in Cart
 * @apiName DeleteCart
 * @apiGroup Cart
 * @apiPermission none
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
 * @apiSuccess {String} status Success.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 * {
 *   "status": "success"
 * }
 *
 * @apiError ProductIsNotInCart This product does not exist in this cart
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   error: "This product does not exist in this cart"
 * }
 *
 * @apiError Cart This user does not have a cart yet
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "This user does not have a cart yet"
 * }
 */
exports.removeProductFromCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const { productId } = req.params;

  const cart = await Cart.findOne({
    where: {
      status: "active",
      userId: currentUser.id
    }
  });

  if (!cart) {
    return next(new AppError(404, "This user does not have a cart yet"));
  }

  const productInCart = await ProductInCart.findOne({
    where: {
      status: "active",
      cartId: cart.id,
      productId
    }
  });

  if (!productInCart) {
    return next(new AppError(404, "This product does not exist in this cart"));
  }

  await productInCart.update({ status: "removed", quantity: 0 });

  res.status(204).json({
    status: "success"
  });
});

// Update status cart
/**
 * @api {post} https://prueba-tecnica-brm.herokuapp.com/api/v1/cart/purchase 5. Purchase
 * @apiName Purchase
 * @apiGroup Cart
 * @apiPermission none
 *
 * @apiHeader {String} token Users unique access-key.
 *
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Authorization": "Bearer {{TOKEN_USER}}"
 * }
 *
 * @apiSuccess {String} status Success.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * {
 *   "id": 2,
 *   "userId": 2,
 *   "status": "purchased",
 *   "createdAt": "2022-05-23T03:39:19.649Z",
 *   "updatedAt": "2022-05-23T03:58:59.072Z",
 *   "user": {user details},
 *   "products": [products details]
 * }
 *
 * @apiError Cart This user does not have a cart yet
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Not Found
 * {
 *   error: "This user does not have a cart yet"
 * }
 */
exports.purchaseCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const cart = await Cart.findOne({
    where: { status: "active", userId: currentUser.id },
    include: [
      { model: User, attributes: { exclude: ["password", "passwordConfirm"] } },
      {
        model: Product,
        through: { where: { status: "active" } }
      }
    ]
  });

  if (!cart) {
    return next(new AppError(404, "This user does not have a cart yet"));
  }

  let totalPrice = 0;

  const cartPromises = cart.products.map(async (product) => {
    await product.productInCart.update({ status: "purchased" });

    const productPrice = product.price * product.productInCart.quantity;

    totalPrice += productPrice;

    const newQty = product.quantityAvailable - product.productInCart.quantity;

    return await product.update({ quantityAvailable: newQty });
  });

  await Promise.all(cartPromises);

  await cart.update({ status: "purchased" });

  await Order.create({
    userId: currentUser.id,
    cartId: cart.id,
    issuedAt: new Date().toString(),
    totalPrice
  });

  res.status(201).json({
    status: "success",
    data: {
      cart
    }
  });
});
