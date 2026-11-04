const nodemailer = require("nodemailer");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =====================================================
// REGISTER CUSTOMER WITH EMAIL OTP
// =====================================================

router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check existing email
        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        // Check existing phone
        const existingPhone = await User.findOne({ phone });

        if (existingPhone) {
            return res.status(400).json({
                message: "User already exists with this phone number"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate secure 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Hash OTP before storing
        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // Generate account number
        const accountNumber = Math.floor(
            100000000000 + Math.random() * 900000000000
        ).toString();

        // Create customer
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            accountNumber,
            balance: 0,
            status: "active",
            role: "customer",

            emailVerified: false,
            emailVerificationOtpHash: otpHash,
            emailVerificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
            emailVerificationOtpAttempts: 0,
            emailVerificationLastSentAt: new Date()
        });

        await user.save();

        // Send OTP email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Valora - Email Verification",
                text: `Welcome to Valora!

Your email verification OTP is: ${otp}

This OTP expires in 10 minutes.

Please do not share this OTP with anyone.`
            });
        } catch (emailError) {
            await User.deleteOne({ _id: user._id });
            throw emailError;
        }

        res.status(201).json({
            message: "Registration successful. Please verify your email using the OTP sent to your inbox."
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});
// =====================================================
// VERIFY CUSTOMER EMAIL
// =====================================================

router.post("/verify-email", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        if (!user.emailVerificationOtpHash ||
            !user.emailVerificationOtpExpires) {
            return res.status(400).json({
                message: "No active OTP found. Please request a new OTP."
            });
        }

        // Check OTP expiry
        if (Date.now() > user.emailVerificationOtpExpires.getTime()) {
            user.emailVerificationOtpHash = undefined;
            user.emailVerificationOtpExpires = undefined;
            user.emailVerificationOtpAttempts = 0;

            await user.save();

            return res.status(400).json({
                message: "OTP expired. Please request a new OTP."
            });
        }

        // Maximum 5 incorrect attempts
        if (user.emailVerificationOtpAttempts >= 5) {
            return res.status(429).json({
                message: "Maximum OTP attempts reached. Please request a new OTP."
            });
        }

        // Hash submitted OTP
        const submittedOtpHash = crypto
            .createHash("sha256")
            .update(otp.toString())
            .digest("hex");

        // Compare OTP hashes
        const isValid = crypto.timingSafeEqual(
            Buffer.from(submittedOtpHash, "hex"),
            Buffer.from(user.emailVerificationOtpHash, "hex")
        );

        if (!isValid) {
            user.emailVerificationOtpAttempts += 1;
            await user.save();

            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Verify email
        user.emailVerified = true;
        user.emailVerificationOtpHash = undefined;
        user.emailVerificationOtpExpires = undefined;
        user.emailVerificationOtpAttempts = 0;

        await user.save();

        res.status(200).json({
            message: "Email verified successfully. You can now login."
        });

    } catch (error) {
        console.error("Email verification error:", error);

        res.status(500).json({
            message: "Email verification failed"
        });
    }
});

// =====================================================
// RESEND EMAIL VERIFICATION OTP
// =====================================================

router.post("/resend-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        // Enforce 60-second cooldown
        if (user.emailVerificationLastSentAt) {
            const timePassed =
                Date.now() - user.emailVerificationLastSentAt.getTime();

            if (timePassed < 60000) {
                return res.status(429).json({
                    message: "Please wait before requesting another OTP."
                });
            }
        }

        // Generate new OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        user.emailVerificationOtpHash = otpHash;
        user.emailVerificationOtpExpires =
            new Date(Date.now() + 10 * 60 * 1000);

        user.emailVerificationOtpAttempts = 0;
        user.emailVerificationLastSentAt = new Date();

        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Valora - New Verification OTP",
            text: `Your new Valora verification OTP is ${otp}. It expires in 10 minutes.`
        });

        res.status(200).json({
            message: "A new OTP has been sent to your email."
        });

    } catch (error) {
        console.error("Resend OTP error:", error);

        res.status(500).json({
            message: "Unable to resend OTP."
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
        // Check email verification
if (!user.emailVerified) {
    return res.status(403).json({
        message: "Please verify your email before logging in."
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