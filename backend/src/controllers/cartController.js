const Cart = require("../models/Cart");
const Machine = require("../models/Machine");

/* GET USER CART GET /api/cart */
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id })
    .populate("items.machineId", "name price images stock");

  res.json(cart || { items: [] });
};

/* ADD TO CART POST /api/cart/add */
exports.addToCart = async (req, res) => {
  const { machineId, quantity = 1 } = req.body;

  const machine = await Machine.findById(machineId);
  if (!machine) return res.status(404).json({ message: "Machine not found" });

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

  const item = cart.items.find(
    i => i.machineId.toString() === machineId
  );

  if (item) {
    item.quantity += quantity;
  } else {
    cart.items.push({ machineId, quantity });
  }

  await cart.save();
  res.json(cart);
};

/* UPDATE QUANTITY PUT /api/cart/update */
exports.updateCartItem = async (req, res) => {
  const { machineId, quantity } = req.body;

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(
    i => i.machineId.toString() === machineId
  );

  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = quantity;
  await cart.save();

  res.json(cart);
};

/* REMOVE ITEM DELETE /api/cart/remove/:machineId */
exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(
    i => i.machineId.toString() !== req.params.machineId
  );

  await cart.save();
  res.json(cart);
};

/* MERGE GUEST CART ON LOGIN POST /api/cart/merge */
exports.mergeCart = async (req, res) => {
  const { items } = req.body;

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

  for (const incoming of items) {
    const existing = cart.items.find(
      i => i.machineId.toString() === incoming.machineId
    );

    if (existing) {
      existing.quantity += incoming.quantity;
    } else {
      cart.items.push(incoming);
    }
  }

  await cart.save();
  res.json(cart);
};

/* CLEAR CART (AFTER ORDER) DELETE /api/cart/clear */
exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user._id });
  res.json({ message: "Cart cleared" });
};
