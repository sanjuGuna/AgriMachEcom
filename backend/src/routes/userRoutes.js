const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserProfile, addAddress } = require("../controllers/userController");

router.get("/me", protect, getUserProfile);
router.post("/addresses", protect, addAddress);

module.exports = router;
