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

// 🔧 CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://paint-loyalty-frontend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  // credentials: true, // Enable only if you use cookies/auth
};

app.use(cors(corsOptions));

// 🧪 Optional CORS debug logging
app.use((req, res, next) => {
  console.log("🔄 Request Origin:", req.headers.origin);
  next();
});

// 🛡 Fallback CORS headers (for Render preflight issues)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Or restrict to specific domain
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// 🧩 Middleware
app.use(express.json());

// 📁 Load Routes
const customerRoutes = require("./routes/customerRoutes");
const insightRoutes = require("./routes/insightRoutes");

// 🏠 Default Route
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
