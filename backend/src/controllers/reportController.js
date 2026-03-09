const Order = require("../models/Order");
const Machine = require("../models/Machine");
const User = require("../models/User");
const Payment = require("../models/Payment");
const mongoose = require("mongoose");

// @desc    Get Sales Report
// @route   GET /api/reports/sales
exports.getSalesReport = async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json(salesData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Product Performance Report
// @route   GET /api/reports/products
exports.getProductPerformanceReport = async (req, res) => {
    try {
        const productData = await Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.machineId",
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                },
            },
            {
                $lookup: {
                    from: "machines",
                    localField: "_id",
                    foreignField: "_id",
                    as: "machineDetails",
                },
            },
            { $unwind: "$machineDetails" },
            {
                $project: {
                    name: "$machineDetails.name",
                    category: "$machineDetails.category",
                    totalSold: 1,
                    totalRevenue: 1,
                },
            },
            { $sort: { totalRevenue: -1 } },
        ]);

        res.json(productData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Farmer/Seller Report
// @route   GET /api/reports/sellers
exports.getFarmerReport = async (req, res) => {
    try {
        const farmerData = await Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "machines",
                    localField: "items.machineId",
                    foreignField: "_id",
                    as: "machine",
                },
            },
            { $unwind: "$machine" },
            {
                $group: {
                    _id: "$machine.createdBy",
                    totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    productsSold: { $sum: "$items.quantity" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "sellerDetails",
                },
            },
            { $unwind: "$sellerDetails" },
            {
                $project: {
                    sellerName: "$sellerDetails.name",
                    sellerEmail: "$sellerDetails.email",
                    totalSales: 1,
                    productsSold: 1,
                },
            },
            { $sort: { totalSales: -1 } },
        ]);

        res.json(farmerData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Customer Report
// @route   GET /api/reports/customers
exports.getCustomerReport = async (req, res) => {
    try {
        const customerStats = await Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            {
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    name: "$userDetails.name",
                    email: "$userDetails.email",
                    totalSpent: 1,
                    orderCount: 1,
                },
            },
            { $sort: { totalSpent: -1 } },
        ]);

        res.json(customerStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Order Status Report
// @route   GET /api/reports/order-status
exports.getOrderStatusReport = async (req, res) => {
    try {
        const statusData = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json(statusData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Payment Report
// @route   GET /api/reports/payments
exports.getPaymentReport = async (req, res) => {
    try {
        const paymentData = await Payment.aggregate([
            {
                $group: {
                    _id: "$status",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const gatewayData = await Payment.aggregate([
            {
                $group: {
                    _id: "$paymentGateway",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json({ statusStats: paymentData, gatewayStats: gatewayData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Inventory Report
// @route   GET /api/reports/inventory
exports.getInventoryReport = async (req, res) => {
    try {
        const inventoryData = await Machine.find({}, "name category stock price")
            .sort({ stock: 1 });

        res.json(inventoryData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Seasonal Demand Report
// @route   GET /api/reports/seasonal
exports.getSeasonalDemandReport = async (req, res) => {
    try {
        const seasonalData = await Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const monthNames = [
            "", "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const formattedData = seasonalData.map(item => ({
            month: monthNames[item._id],
            totalRevenue: item.totalRevenue,
            orderCount: item.orderCount
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
