const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();


// =====================================================
// REGISTER CUSTOMER
// =====================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;


        // Validate required fields
        if (!name || !email || !phone || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }


        // Check existing email
        const existingEmail =
            await User.findOne({ email });

        if (existingEmail) {

            return res.status(400).json({
                message:
                    "User already exists with this email"
            });
        }


        // Check existing phone
        const existingPhone =
            await User.findOne({ phone });

        if (existingPhone) {

            return res.status(400).json({
                message:
                    "User already exists with this phone number"
            });
        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Generate account number
        const accountNumber =
            Math.floor(
                100000000000 +
                Math.random() * 900000000000
            ).toString();


        // Create customer
        const user = new User({

            name,
            email,
            phone,

            password:
                hashedPassword,

            accountNumber,

            balance: 0,

            status: "active",

            role: "customer"

        });


        await user.save();


        res.status(201).json({

            message:
                "Account registered successfully. Please login.",

            accountNumber:
                user.accountNumber

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({

            message:
                "Registration failed",

            error:
                error.message

        });
    }
});


// =====================================================
// CUSTOMER LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Find user
        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });
        }


        // Check account status
        if (
            user.status ===
            "suspended"
        ) {

            return res.status(403).json({

                message:
                    "Your account has been suspended. Please contact Valora support."

            });
        }


        // Check password
        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordValid) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });
        }


        // Create JWT
        const token =
            jwt.sign(

                {
                    userId:
                        user._id,

                    role:
                        user.role

                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1h"
                }

            );


        res.json({

            message:
                "Login successful",

            token

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            message:
                "Login failed",

            error:
                error.message

        });
    }
});


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post("/admin-login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Current project admin credentials
        if (
            email !==
                "admin@valora.com" ||

            password !==
                "Admin@123"
        ) {

            return res.status(401).json({

                message:
                    "Invalid admin email or password"

            });
        }


        // Create admin JWT
        const token =
            jwt.sign(

                {
                    role:
                        "admin"
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "2h"
                }

            );


        res.json({

            message:
                "Admin login successful",

            token

        });


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        res.status(500).json({

            message:
                "Admin login failed"

        });
    }
});


module.exports = router;