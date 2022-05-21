// Importing the required modules
const express = require("express");
const router = express.Router();

// Import Controllers
const {
  createProduct,
  getAllProducts,
  productById,
  deleteUser,
  updateProduct
} = require("../controllers/product.controller");

// Import Middlewares
const {
  createProductValidators,
  validationResults
} = require("../middlewares/validators.middleware");
const {
  validateSession,
  protectAdmin
} = require("../middlewares/auth.middleware");

// Routes
router.use(validateSession);

router.use(protectAdmin);

router.get("/", getAllProducts);

router.post(
  "/create-product",
  createProductValidators,
  validationResults,
  createProduct
);

router.patch("/update-product/:id", updateProduct);

router.delete("/delete-product/:id", deleteUser);

router.route("/:id").get(productById);

module.exports = { ProductRouter: router };
