const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(
    cors({
        origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3001"],
        credentials: true,
    })
);
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/academic", require("./routes/academicRoutes"));

// Health check route
app.get(["/", "/api/health"], (req, res) => {
    res.json({
        status: "success",
        message: "Imperial College of Engineering (ICE) API Server is Running",
        database: "MongoDB Atlas Connected",
        endpoints: {
            auth: "/api/auth (register, login, users)",
            academic: "/api/academic (courses, attendance, results, library, payments, notices, jobs)",
        },
        timestamp: new Date().toISOString(),
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 ICE Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
