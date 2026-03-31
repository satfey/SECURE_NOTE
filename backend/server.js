require("dotenv").config();

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./route/api");
const authRoutes = require("./route/login");

const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// เชื่อม route เข้ากับ server
app.use("/api", apiRoutes);
app.use("/auth", authRoutes);

// route ทดสอบ
app.get("/", (req, res) => {
  res.send("SecureNote backend is running");
});


app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});