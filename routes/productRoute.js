const express = require("express");
const router = express.Router();

const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  filterProducts,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/:id", getaProduct);
router.get("/", getAllProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/filter", filterProducts);

module.exports = router;
