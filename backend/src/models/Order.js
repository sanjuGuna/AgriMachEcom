const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
        },

        price: {
            type: Number,
            required: true
        }
      }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    },

    orderStatus: {
        type: String,
        enum: ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "PLACED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
