const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Machine = require("../models/Machine");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ── Helper: validate items & compute total ── */
async function buildOrderItems(items) {
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const machine = await Machine.findById(item.machineId);
    if (!machine) throw { status: 404, message: `Machine not found: ${item.machineId}` };
    if (machine.stock < item.quantity)
      throw { status: 400, message: `Insufficient stock for ${machine.name}` };

    totalAmount += machine.price * item.quantity;
    orderItems.push({ machineId: machine._id, quantity: item.quantity, price: machine.price });
  }
  return { orderItems, totalAmount };
}

/* ── CREATE ORDER  POST /api/orders ── */
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod = "COD" } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order items are required" });
    if (!deliveryAddress)
      return res.status(400).json({ message: "Delivery address is required" });
    if (!["COD", "ONLINE"].includes(paymentMethod))
      return res.status(400).json({ message: "Invalid payment method" });

    const { orderItems, totalAmount } = await buildOrderItems(items).catch((err) => {
      throw err;
    });

    if (paymentMethod === "ONLINE") {
      // Create a Razorpay order first; our DB order is created after payment verification
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
      });

      // Save a PENDING order so we can reference it during verification
      const order = await Order.create({
        userId: req.user._id,
        items: orderItems,
        deliveryAddress,
        totalAmount,
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        orderStatus: "PLACED",
        razorpayOrderId: razorpayOrder.id,
      });

      return res.status(201).json({
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentMethod: "ONLINE",
      });
    }

    // COD — create order directly
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      deliveryAddress,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    return res.status(201).json(order);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

/* ── VERIFY PAYMENT  POST /api/orders/verify-payment ── */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Validate signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      // Mark order as FAILED
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "FAILED" });
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Mark order as PAID
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "PAID",
        razorpayPaymentId,
        razorpaySignature,
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Payment verified successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── GET MY ORDERS  GET /api/orders/my ── */
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

/* ── GET ALL ORDERS (ADMIN)  GET /api/orders ── */
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

/* ── GET ORDER BY ID  GET /api/orders/:id ── */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.machineId", "name price images");

    if (!order) return res.status(404).json({ message: "Order not found" });

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

/* ── UPDATE ORDER STATUS (ADMIN)  PUT /api/orders/:id/status ── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatus = ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: "Invalid order status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
