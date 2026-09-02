const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/account");

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {

    res.json({
        status: "UP",
        message: "Valora backend is running"
    });

});


// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message: "Welcome to Valora Banking API"
    });

});


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({
        message: "API endpoint not found"
    });

});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {

    console.error("Server error:", error);

    res.status(500).json({
        message: "Internal server error"
    });

});


// =====================================================
// DATABASE + SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/valora";


mongoose
    .connect(MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {

            console.log(
                `Valora server running on port ${PORT}`
            );

        });

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    });