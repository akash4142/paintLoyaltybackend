const express = require("express");
const router = express.Router();
const { Customer } = require("../db");

// 🚀 Add new customer
router.post("/", async (req, res) => {
  try {
    const newCustomer = new Customer({
      ...req.body,
      purchases: [],
      totalGallons: 0,
      freePaintClaimed: false,
      freePaintCount: 0,
      createdAt: new Date()
    });

    const created = await newCustomer.save();
    console.log("✅ New customer created:", created._id);
    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Failed to create customer:", err);
    res.status(500).send({ error: "Failed to create customer" });
  }
});

// 📦 Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();

    const enhanced = customers.map((c) => {
      const totalGallons = c.totalGallons || 0;
      const pendingFreePaints = Math.floor(totalGallons / 8);
      const gallonsToNextReward = totalGallons < 8 ? 8 - totalGallons : 0;

      return {
        ...c.toObject(),
        pendingFreePaints,
        gallonsToNextReward
      };
    });

    res.json(enhanced);
  } catch (err) {
    console.error("❌ Error loading customers:", err);
    res.status(500).send("Failed to load customers");
  }
});


// 🎨 Add paint purchase with carryover logic

router.put("/:id/purchase", async (req, res) => {
  const { gallons } = req.body;

  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("Customer not found");

    // 1. 📦 Add to customer purchase history
    customer.purchases.push({
      date: new Date().toISOString(),
      gallons,
    });

    // 2. ➕ Update customer total
    customer.totalGallons += gallons;
    await customer.save();

    // 3. 📊 Update monthly insight
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-05"
    let insight = await insight.findOne({ month: currentMonth });

    if (!insight) {
      // 🚀 Create new month record
      insight = new insight({
        month: currentMonth,
        totalGallonsSold: gallons,
        totalFreeGiven: 0,
        newCustomers: 0
      });
    } else {
      insight.totalGallonsSold += gallons;
    }

    await insight.save();

    // 4. ✅ Return updated customer
    res.json(customer);
  } catch (err) {
    console.error("❌ Error updating purchase:", err);
    res.status(500).send(err);
  }
});



// 🎁 Claim one free paint manually
router.put("/:id/reset", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("Customer not found");

    // 🚫 Not enough gallons for a reward
    if (customer.totalGallons < 8) {
      return res.status(400).json({ error: "Not enough gallons to claim a free paint." });
    }

    // 🧮 Subtract 8 gallons and track claimed reward
    customer.totalGallons -= 8;
    customer.freePaintCount = (customer.freePaintCount || 0) + 1;
    customer.purchases.push({ date: new Date(), note: "🎁 Free Paint Claimed" });

    await customer.save();
    res.json(customer);
  } catch (err) {
    console.error("❌ Error claiming free paint:", err);
    res.status(500).send(err);
  }
});


module.exports = router;
