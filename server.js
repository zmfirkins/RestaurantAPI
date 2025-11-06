// Import packages
const express = require("express");
const { body, validationResult } = require("express-validator");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Initialize app and port
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  if (["POST", "PUT"].includes(req.method)) {
    console.log("Body:", req.body);
  }
  next();
});

// Data for the server
let menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Validation middleware
const validateMenuItem = [
  body("name").isString().isLength({ min: 3 }),
  body("description").isString().isLength({ min: 10 }),
  body("price").isFloat({ gt: 0 }),
  body("category").isIn(["appetizer", "entree", "dessert", "beverage"]),
  body("ingredients").isArray(),
  body("available").isBoolean(),
];

// Routes

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant API 🍔");
});

// GET all menu items
app.get("/menu", (req, res) => {
  res.json(menuItems);
});

// GET a menu item by ID
app.get("/menu/:id", (req, res) => {
  const item = menuItems.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Menu item not found" });
  res.json(item);
});

// POST a new menu item
app.post("/menu", validateMenuItem, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newItem = {
    id: menuItems.length + 1,
    ...req.body
  };

  menuItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT (update) a menu item
app.put("/menu/:id", validateMenuItem, (req, res) => {
  const item = menuItems.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Menu item not found" });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Object.assign(item, req.body);
  res.json(item);
});

// DELETE a menu item
app.delete("/menu/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = menuItems.findIndex(i => i.id === id);
  if (index === -1) return res.status(404).json({ message: "Menu item not found" });

  menuItems.splice(index, 1);
  res.status(204).send();
});

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Restaurant API",
      version: "1.0.0",
      description: "API for managing restaurant menu items",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
