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
