const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 3;
        },
        message: "At least 3 images are required"
      }
    },

    stock: {
      type: Number,
      required: true,
      min: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Machine || mongoose.model("Machine", machineSchema);
