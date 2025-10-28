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

function saveUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
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

// Statistics Dashboard
router.get("/statistics", (req, res) => {
  if (!req.session.user || req.session.user.role !== "manager") {
    return res.redirect("/login");
  }

  const deliveries = getDeliveries();
  const users = getUsers();
  
  // Calculate statistics
  const stats = {
    totalDeliveries: deliveries.length,
    pending: deliveries.filter(d => d.status === "Pending").length,
    inProgress: deliveries.filter(d => d.status === "In Progress").length,
    delivered: deliveries.filter(d => d.status === "Delivered").length,
    totalPersonnel: users.filter(u => u.role === "personnel").length,
    totalManagers: users.filter(u => u.role === "manager").length,
  };

  // Personnel performance
  const personnelStats = users
    .filter(u => u.role === "personnel")
    .map(p => {
      const userDeliveries = deliveries.filter(d => d.assignedTo === p.username);
      return {
        username: p.username,
        total: userDeliveries.length,
        delivered: userDeliveries.filter(d => d.status === "Delivered").length,
        pending: userDeliveries.filter(d => d.status === "Pending").length,
        inProgress: userDeliveries.filter(d => d.status === "In Progress").length,
      };
    });

  // Recent deliveries (last 5)
  const recentDeliveries = deliveries.slice(-5).reverse();

  res.render("statistics", { 
    stats, 
    personnelStats, 
    recentDeliveries,
    user: req.session.user 
  });
});

// User Management Page
router.get("/users", (req, res) => {
  if (!req.session.user || req.session.user.role !== "manager") {
    return res.redirect("/login");
  }

  const users = getUsers();
  res.render("users", { users, user: req.session.user });
});

// Assign Delivery
router.post("/assign", (req, res) => {
  const { description, customerName, customerPhone, address, priority, assignedTo } = req.body;
  const deliveries = getDeliveries();

  const newDelivery = {
    id: Date.now(),
    description,
    customerName: customerName || "N/A",
    customerPhone: customerPhone || "N/A",
    address: address || "N/A",
    priority: priority || "Medium",
    assignedTo,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  deliveries.push(newDelivery);
  saveDeliveries(deliveries);
  res.redirect("/manager/dashboard");
});

// Edit Delivery - Get form
router.get("/edit-delivery/:id", (req, res) => {
  if (!req.session.user || req.session.user.role !== "manager") {
    return res.redirect("/login");
  }

  const deliveries = getDeliveries();
  const delivery = deliveries.find(d => d.id == req.params.id);
  const personnel = getUsers().filter((u) => u.role === "personnel");

  if (!delivery) {
    return res.redirect("/manager/dashboard");
  }

  res.render("edit-delivery", { delivery, personnel, user: req.session.user });
});

// Edit Delivery - Update
router.post("/edit-delivery/:id", (req, res) => {
  const { description, customerName, customerPhone, address, priority, assignedTo, status } = req.body;
  const deliveries = getDeliveries();
  const deliveryIndex = deliveries.findIndex(d => d.id == req.params.id);

  if (deliveryIndex !== -1) {
    deliveries[deliveryIndex] = {
      ...deliveries[deliveryIndex],
      description,
      customerName: customerName || "N/A",
      customerPhone: customerPhone || "N/A",
      address: address || "N/A",
      priority: priority || "Medium",
      assignedTo,
      status,
      updatedAt: new Date().toISOString(),
    };
    saveDeliveries(deliveries);
  }

  res.redirect("/manager/dashboard");
});

// Delete Delivery
router.post("/delete-delivery/:id", (req, res) => {
  const deliveries = getDeliveries();
  const filtered = deliveries.filter(d => d.id != req.params.id);
  saveDeliveries(filtered);
  res.redirect("/manager/dashboard");
});

// Add User
router.post("/add-user", (req, res) => {
  const { username, password, role } = req.body;
  const users = getUsers();

  // Check if user already exists
  if (users.find(u => u.username === username)) {
    return res.redirect("/manager/users?error=exists");
  }

  const newUser = { username, password, role };
  users.push(newUser);
  saveUsers(users);
  res.redirect("/manager/users");
});

// Edit User - Get form
router.get("/edit-user/:username", (req, res) => {
  if (!req.session.user || req.session.user.role !== "manager") {
    return res.redirect("/login");
  }

  const users = getUsers();
  const editUser = users.find(u => u.username === req.params.username);

  if (!editUser) {
    return res.redirect("/manager/users");
  }

  res.render("edit-user", { editUser, user: req.session.user });
});

// Edit User - Update
router.post("/edit-user/:username", (req, res) => {
  const { newUsername, password, role } = req.body;
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === req.params.username);

  if (userIndex !== -1) {
    users[userIndex] = {
      username: newUsername,
      password,
      role,
    };
    saveUsers(users);
  }

  res.redirect("/manager/users");
});

// Delete User
router.post("/delete-user/:username", (req, res) => {
  const users = getUsers();
  const filtered = users.filter(u => u.username !== req.params.username);
  saveUsers(filtered);
  res.redirect("/manager/users");
});

// Search/Filter Deliveries
router.get("/search", (req, res) => {
  if (!req.session.user || req.session.user.role !== "manager") {
    return res.redirect("/login");
  }

  const { query, status, priority } = req.query;
  let deliveries = getDeliveries();
  const personnel = getUsers().filter((u) => u.role === "personnel");

  // Filter by search query
  if (query) {
    deliveries = deliveries.filter(d => 
      d.description.toLowerCase().includes(query.toLowerCase()) ||
      d.customerName.toLowerCase().includes(query.toLowerCase()) ||
      d.assignedTo.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filter by status
  if (status && status !== "all") {
    deliveries = deliveries.filter(d => d.status === status);
  }

  // Filter by priority
  if (priority && priority !== "all") {
    deliveries = deliveries.filter(d => d.priority === priority);
  }

  res.render("dashboard", { 
    deliveries, 
    personnel, 
    user: req.session.user,
    filters: { query, status, priority }
  });
});

module.exports = router;
