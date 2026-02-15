const User = require("../models/User");

/* GET USER PROFILE */
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ADD NEW ADDRESS */
const addAddress = async (req, res) => {
    try {
        const { fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newAddress = {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            isDefault: isDefault || false
        };

        // If setting as default, unset other defaults
        if (newAddress.isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // If it's the first address, make it default automatically if not specified
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, addAddress };
