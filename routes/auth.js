// routes/auth.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../data/users.json");

// Load users
function getUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, "utf-8"));
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle registration
router.post("/register", (req, res) => {
  const { username, password, role } = req.body;
  const users = getUsers();

  if (users.find((u) => u.username === username)) {
    return res.render("register", { error: "User already exists!" });
  }

  users.push({ username, password, role });
  saveUsers(users);

  res.render("login", { success: "Account created successfully! Please login." });
});

// Handle login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.render("login", { error: "Invalid credentials!" });
  }

  req.session.user = user;

  if (user.role === "manager") {
    return res.redirect("/manager/dashboard");
  } else {
    return res.redirect("/personnel/dashboard");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
