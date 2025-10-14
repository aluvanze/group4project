// routes/personnel.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const deliveriesPath = path.join(__dirname, "../data/deliveries.json");

function getDeliveries() {
  if (!fs.existsSync(deliveriesPath)) return [];
  return JSON.parse(fs.readFileSync(deliveriesPath, "utf-8"));
}

function saveDeliveries(data) {
  fs.writeFileSync(deliveriesPath, JSON.stringify(data, null, 2));
}

// Dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.user || req.session.user.role !== "personnel") {
    return res.redirect("/login");
  }

  const deliveries = getDeliveries().filter(
    (d) => d.assignedTo === req.session.user.username
  );

  res.render("personnel", { deliveries, user: req.session.user });
});

// Update Delivery Status
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const deliveries = getDeliveries();
  const delivery = deliveries.find((d) => d.id == id);
  
  if (delivery) {
    delivery.status = status;
    saveDeliveries(deliveries);
  }
  
  res.redirect("/personnel/dashboard");
});

module.exports = router;
