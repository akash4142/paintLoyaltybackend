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

    // ✅ Validate input
    if (!gallons || isNaN(gallons) || gallons < 1) {
      return res.status(400).json({ error: "Invalid gallons value" });
    }

    // ➕ Add to purchases
    customer.purchases.push({
      date: new Date().toISOString(),
      gallons,
    });

    customer.totalGallons += gallons;
    await customer.save();

    // ✅ Return plain JSON (not a mongoose doc)
    res.json({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      totalGallons: customer.totalGallons,
      freePaintCount: customer.freePaintCount,
      purchases: customer.purchases,
      createdAt: customer.createdAt
    });

  } catch (err) {
    console.error("❌ Error in /purchase route:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.put("/:id/reset", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("Customer not found");

    const totalEarned = Math.floor(customer.totalGallons / 8);
    const claimed = customer.freePaintCount || 0;
    const available = totalEarned - claimed;

    if (available <= 0) {
      return res.status(400).json({ error: "No free paints to claim." });
    }

    // ✅ Just increment free paint count
    customer.freePaintCount = claimed + 1;

    // 📝 Log the reward claim
    customer.purchases.push({
      date: new Date().toISOString(),
      note: "🎁 Free Paint Claimed"
    });

    await customer.save();
    res.json(customer);
  } catch (err) {
    console.error("❌ Error claiming free paint:", err);
    res.status(500).send(err);
  }
});


module.exports = router;
