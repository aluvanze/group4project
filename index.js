// index.js

const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const exphbs = require("express-handlebars");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
  session({
    secret: "delivery-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Handlebars setup
app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require("./routes/auth");
const managerRoutes = require("./routes/manager");
const personnelRoutes = require("./routes/personnel");

app.use("/", authRoutes);
app.use("/manager", managerRoutes);
app.use("/personnel", personnelRoutes);

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
