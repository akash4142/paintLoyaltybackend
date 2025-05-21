const express = require("express");
const moment = require("moment");
const router = express.Router();

const { Customer, Insight } = require("../db");

// 📊 GET monthly insights
router.get("/", async (req, res) => {
  const currentMonth = moment().format("YYYY-MM");
  const startOfMonth = moment().startOf("month").toDate();

  try {
    // 🧹 Remove existing insight for this month (if any)
    await Insight.deleteOne({ month: currentMonth });

    // 🧠 Fetch all customers
    const customers = await Customer.find({});

    let newCustomers = 0;
    let totalGallonsSold = 0;
    let totalFreeGiven = 0;

    customers.forEach((customer) => {
      const purchasesThisMonth = (customer.purchases || []).filter((p) => {
        const date = new Date(p.date);
        return date >= startOfMonth;
      });

      totalGallonsSold += purchasesThisMonth.reduce(
        (sum, p) => sum + (p.gallons || 0),
        0
      );

      purchasesThisMonth.forEach((p) => {
        if (p.note === "🎁 Free Paint Claimed") {
          totalFreeGiven += 1;
        }
      });

      if (
        customer.createdAt &&
        new Date(customer.createdAt) >= startOfMonth
      ) {
        newCustomers += 1;
      }
    });

    // 📥 Create and save new insight
    const newInsight = new Insight({
      month: currentMonth,
      newCustomers,
      totalGallonsSold,
      totalFreeGiven,
      createdAt: new Date(),
    });

    const savedInsight = await newInsight.save();
    res.json(savedInsight);
  } catch (err) {
    console.error("❌ Error generating insights:", err);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

module.exports = router;
