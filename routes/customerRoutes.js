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
    const customers = await Customer.find({});
    res.json(customers);
  } catch (err) {
    res.status(500).send(err);
  }
});

// 🎨 Add paint purchase with carryover logic
router.put("/:id/purchase", async (req, res) => {
  const { gallons } = req.body;

  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("Customer not found");

    let updatedGallons = customer.totalGallons + gallons;
    let freePaintClaimed = customer.freePaintClaimed;

    // 🎁 If they hit 8+ and haven't claimed yet, mark eligible and subtract 8 gallons
    if (updatedGallons >= 8 && !freePaintClaimed) {
      freePaintClaimed = true;
      updatedGallons -= 8;
    }

    customer.purchases.push({ date: new Date(), gallons });
    customer.totalGallons = updatedGallons;
    customer.freePaintClaimed = freePaintClaimed;

    const updated = await customer.save();
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating purchase:", err);
    res.status(500).send(err);
  }
});

// 🔄 Reset after claiming free paint
router.put("/:id/reset", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("Customer not found");

    customer.purchases.push({ date: new Date(), note: "🎁 Free Paint Claimed" });
    customer.freePaintClaimed = false;
    customer.freePaintCount = (customer.freePaintCount || 0) + 1;

    const updated = await customer.save();
    res.json(updated);
  } catch (err) {
    console.error("❌ Error resetting claim:", err);
    res.status(500).send(err);
  }
});

module.exports = router;
