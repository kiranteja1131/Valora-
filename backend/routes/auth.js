const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
try {
const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists with this email"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const accountNumber = Math.floor(
        100000000000 + Math.random() * 900000000000
    ).toString();

    const user = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        accountNumber
    });

    await user.save();

    res.status(201).json({
        message: "Account registered successfully. Please login."
    });

} catch (error) {
    res.status(500).json({
        message: "Registration failed",
        error: error.message
    });
}

});

// Login user
router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({
        message: "Login successful",
        token
    });

} catch (error) {
    res.status(500).json({
        message: "Login failed",
        error: error.message
    });
}

});
// Admin Login
router.post("/admin-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Dedicated admin credentials
        if (
            email !== "admin@valora.com" ||
            password !== "Admin@123"
        ) {
            return res.status(401).json({
                message: "Invalid admin email or password"
            });
        }

        const token = jwt.sign(
            {
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Admin login successful",
            token
        });

    } catch (error) {
        console.error("Admin login error:", error);

        res.status(500).json({
            message: "Admin login failed"
        });
    }
});
module.exports = router;
