require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// 📦 Define Customer Schema
const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  purchases: [
    {
      date: String,
      gallons: Number,
      note: String, // For entries like "🎁 Free Paint Claimed"
    }
  ],
  totalGallons: { type: Number, default: 0 },
  freePaintClaimed: { type: Boolean, default: false },
  freePaintCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 📊 Define Insights Schema
const insightsSchema = new mongoose.Schema({
  month: String,
  totalGallonsSold: Number,
  totalFreeGiven: Number,
  newCustomers: Number,
  createdAt: { type: Date, default: Date.now }
});

// 🧠 Create Models
const Customer = mongoose.model('Customer', customerSchema);
const Insight = mongoose.model('Insight', insightsSchema);

// 📤 Export models
module.exports = {
  Customer,
  Insight
};
