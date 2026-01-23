const Order = require("../models/Order");
const Machine = require("../models/Machine");

/* CREATE ORDER (USER) POST /api/orders */
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Validate address
    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate machines & calculate total
    for (const item of items) {
      const machine = await Machine.findById(item.machineId);

      if (!machine) {
        return res.status(404).json({
          message: `Machine not found: ${item.machineId}`
        });
      }

      if (machine.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${machine.name}`
        });
      }

      totalAmount += machine.price * item.quantity;

      orderItems.push({
        machineId: machine._id,
        quantity: item.quantity,
        price: machine.price
      });
    }

    // CREATE ORDER WITH ADDRESS
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      deliveryAddress, 
      totalAmount,
      paymentStatus: "PENDING",
      orderStatus: "PLACED"
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* GET LOGGED-IN USER ORDERS GET /api/orders/my */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.machineId", "name price images")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL ORDERS (ADMIN) GET /api/orders */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.machineId", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ORDER BY IDGET /api/orders/:id*/
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.machineId", "name price images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Allow only owner or admin
    if (
      order.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE ORDER STATUS (ADMIN) PUT /api/orders/:id/status */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
