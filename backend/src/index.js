require('dotenv').config({ path: './.env' });
const express = require("express");
const app = express();
const connectDB = require("./config/db");
connectDB();

// Middleware
app.use(express.json());
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/machines", require("./routes/machineRoutes"));
app.use("/api/orders",require("./routes/orderRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
