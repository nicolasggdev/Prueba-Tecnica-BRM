// Importing the required modules
const express = require("express");
const router = express.Router();

// Import Controllers
const {
  getUserCart,
  addProductToCart,
  updateCartProduct,
  removeProductFromCart,
  purchaseCart
} = require("../controllers/cart.controllers");

// Import Middlewares
const {
  addProductToCartValidation,
  validationResults
} = require("../middlewares/validators.middleware");
const { validateSession } = require("../middlewares/auth.middleware");

// Routes
router.use(validateSession);

router.get("/", getUserCart);

router.post(
  "/add-product",
  addProductToCartValidation,
  validationResults,
  addProductToCart
);

router.patch("/update-product", updateCartProduct);

router.delete("/:productId", removeProductFromCart);

router.post("/purchase", purchaseCart);

module.exports = { cartRouter: router };
