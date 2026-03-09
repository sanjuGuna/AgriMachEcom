const express = require("express");
const router = express.Router();
const {
    getSalesReport,
    getProductPerformanceReport,
    getCustomerReport,
    getOrderStatusReport,
    getPaymentReport,
    getInventoryReport,
    getSeasonalDemandReport,
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All routes are protected and admin only
router.use(protect, adminOnly);

router.get("/sales", getSalesReport);
router.get("/products", getProductPerformanceReport);
router.get("/customers", getCustomerReport);
router.get("/order-status", getOrderStatusReport);
router.get("/payments", getPaymentReport);
router.get("/inventory", getInventoryReport);
router.get("/seasonal", getSeasonalDemandReport);

module.exports = router;
