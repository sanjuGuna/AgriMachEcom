const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  mergeCart,
  clearCart
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove/:machineId", protect, removeFromCart);
router.post("/merge", protect, mergeCart);
router.delete("/clear", protect, clearCart);

module.exports = router;
