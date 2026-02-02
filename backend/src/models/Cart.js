const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    items: [
      {
        machineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Machine",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model.Cart || mongoose.model("Cart",cartSchema);
