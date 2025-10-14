// routes/manager.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const deliveriesPath = path.join(__dirname, "../data/deliveries.json");
const usersPath = path.join(__dirname, "../data/users.json");

function getDeliveries() {
  if (!fs.existsSync(deliveriesPath)) return [];
  return JSON.parse(fs.readFileSync(deliveriesPath, "utf-8"));
}

function saveDeliveries(data) {
  fs.writeFileSync(deliveriesPath, JSON.stringify(data, null, 2));
}

function getUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, "utf-8"));
}

// Dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.user || req.session.user.role !== "manager") {
    return res.redirect("/login");
  }

  const deliveries = getDeliveries();
  const personnel = getUsers().filter((u) => u.role === "personnel");

  res.render("dashboard", { deliveries, personnel, user: req.session.user });
});

// Assign Delivery
router.post("/assign", (req, res) => {
  const { description, assignedTo } = req.body;
  const deliveries = getDeliveries();

  const newDelivery = {
    id: deliveries.length + 1,
    description,
    assignedTo,
    status: "Pending",
  };

  deliveries.push(newDelivery);
  saveDeliveries(deliveries);
  res.redirect("/manager/dashboard");
});

module.exports = router;
