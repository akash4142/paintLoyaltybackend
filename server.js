// backend/server.js
require("dotenv").config(); // Load environment variables early
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5500;

// 📦 Connect to MongoDB Atlas
require("./db"); // Automatically connects via db.js

// 🛡 Catch unexpected crashes
process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception:", err);
});

// 🔧 Middleware

app.use(cors({
  origin: ["http://localhost:3000", "https://paint-loyalty-frontend.onrender.com"],
  credentials: true,
}));

app.use(express.json());

// 📁 Load Routes
const customerRoutes = require("./routes/customerRoutes");
const insightRoutes = require("./routes/insightRoutes");

app.get("/", (req, res) => {
  res.send("🎉 Paint Loyalty Backend is running!");
});


// 🚀 Use Routes
app.use("/api/customers", customerRoutes);
app.use("/api/insights", insightRoutes);

// 🚦 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`);
});
