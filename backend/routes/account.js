const express = require("express");
const User = require("../models/user");
const authenticateToken = require("../middleware/authmiddleware");
const DepositRequest = require("../models/depositRequest");

const router = express.Router();


// =====================================================
// Helper: Check Admin
// =====================================================
function requireAdmin(req, res, next) {

    if (req.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
}


// =====================================================
// Dashboard
// =====================================================
router.get("/dashboard", authenticateToken, async (req, res) => {

    try {

        const user = await User
            .findById(req.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            name: user.name,
            accountNumber: user.accountNumber,
            balance: user.balance,

            transactions: user.transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
        });

    } catch (error) {

        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to fetch account details"
        });
    }
});


// =====================================================
// Money Transfer
// =====================================================
router.post("/transfer", authenticateToken, async (req, res) => {

    try {

        const {
            recipientAccountNumber,
            amount
        } = req.body;


        // Validate recipient
        if (!recipientAccountNumber) {

            return res.status(400).json({
                message: "Recipient account number or phone is required"
            });
        }


        // Validate amount
        if (!amount || Number(amount) <= 0) {

            return res.status(400).json({
                message: "Transfer amount must be greater than 0"
            });
        }


        const transferAmount = Number(amount);


        // Find sender
        const sender = await User.findById(req.userId);

        if (!sender) {

            return res.status(404).json({
                message: "Sender account not found"
            });
        }


        // Find recipient using:
        // Account Number OR Phone Number
        const recipientUser = await User.findOne({
            $or: [
                {
                    accountNumber:
                        recipientAccountNumber
                },
                {
                    phone:
                        recipientAccountNumber
                }
            ]
        });


        // Recipient not found
        if (!recipientUser) {

            return res.status(404).json({
                message:
                    "Recipient does not have a Valora account"
            });
        }


        // Prevent self transfer
        if (
            sender._id.equals(
                recipientUser._id
            )
        ) {

            return res.status(400).json({
                message:
                    "You cannot transfer money to your own account"
            });
        }


        // Check balance
        if (
            Number(sender.balance) <
            transferAmount
        ) {

            return res.status(400).json({
                message:
                    "Insufficient balance"
            });
        }


        // Deduct from sender
        sender.balance -= transferAmount;


        // Add to recipient
        recipientUser.balance += transferAmount;


        // Sender transaction
        sender.transactions.push({

            description:
                `Transfer to ${recipientUser.name}`,

            type: "debit",

            amount: transferAmount

        });


        // Recipient transaction
        recipientUser.transactions.push({

            description:
                `Received from ${sender.name}`,

            type: "credit",

            amount: transferAmount

        });


        // Save both users
        await sender.save();
        await recipientUser.save();


        res.json({

            message:
                "Money transferred successfully",

            balance:
                sender.balance

        });


    } catch (error) {

        console.error(
            "Transfer error:",
            error
        );

        res.status(500).json({
            message:
                "Transfer failed"
        });
    }
});


// =====================================================
// Direct Deposit
// =====================================================
router.post("/deposit", authenticateToken, async (req, res) => {

    try {

        const { amount } = req.body;


        if (!amount || Number(amount) <= 0) {

            return res.status(400).json({
                message:
                    "Enter a valid deposit amount"
            });
        }


        const user =
            await User.findById(req.userId);


        if (!user) {

            return res.status(404).json({
                message:
                    "Account not found"
            });
        }


        const depositAmount =
            Number(amount);


        // Add money
        user.balance += depositAmount;


        // Add transaction
        user.transactions.push({

            description:
                "Cash deposit",

            type:
                "credit",

            amount:
                depositAmount

        });


        await user.save();


        res.json({

            message:
                "Money deposited successfully",

            balance:
                user.balance

        });


    } catch (error) {

        console.error(
            "Deposit error:",
            error
        );

        res.status(500).json({
            message:
                "Deposit failed"
        });
    }
});


// =====================================================
// Create Deposit Request
// =====================================================
router.post(
    "/deposit-request",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                amount,
                reason
            } = req.body;


            // Validate amount
            if (
                !amount ||
                Number(amount) <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Enter a valid deposit amount"
                });
            }


            // Find user
            const user =
                await User.findById(req.userId);


            if (!user) {

                return res.status(404).json({
                    message:
                        "Account not found"
                });
            }


            // Prevent multiple pending requests
            const existingRequest =
                await DepositRequest.findOne({

                    user:
                        req.userId,

                    status:
                        "pending"

                });


            if (existingRequest) {

                return res.status(400).json({
                    message:
                        "You already have a pending deposit request"
                });
            }


            // Create request
            const request =
                await DepositRequest.create({

                    user:
                        req.userId,

                    amount:
                        Number(amount),

                    reason:
                        reason ||
                        "Cash deposit",

                    status:
                        "pending"

                });


            res.status(201).json({

                message:
                    "Deposit request submitted successfully",

                requestId:
                    request._id

            });


        } catch (error) {

            console.error(
                "Deposit request error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to submit deposit request"
            });
        }
    }
);


// =====================================================
// Get Pending Deposit Requests
// ADMIN ONLY
// =====================================================
router.get(
    "/deposit-requests",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const requests =
                await DepositRequest.find({
                    status: "pending"
                })
                .populate(
                    "user",
                    "name email phone accountNumber"
                )
                .sort({
                    createdAt: -1
                });


            res.json(requests);


        } catch (error) {

            console.error(
                "Fetch deposit requests error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch deposit requests"
            });
        }
    }
);


// =====================================================
// Approve Deposit Request
// ADMIN ONLY
// =====================================================
router.put(
    "/deposit-requests/:id/approve",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const request =
                await DepositRequest
                    .findById(req.params.id)
                    .populate("user");


            if (!request) {

                return res.status(404).json({
                    message:
                        "Deposit request not found"
                });
            }


            // Make sure it is still pending
            if (
                request.status !==
                "pending"
            ) {

                return res.status(400).json({
                    message:
                        "Request already processed"
                });
            }


            const customer =
                request.user;


            if (!customer) {

                return res.status(404).json({
                    message:
                        "Customer account not found"
                });
            }


            // Add money to customer
            customer.balance +=
                Number(request.amount);


            // Add transaction
            customer.transactions.push({

                description:
                    "Deposit approved by admin",

                type:
                    "credit",

                amount:
                    Number(request.amount)

            });


            await customer.save();


            // Update request
            request.status =
                "approved";


            await request.save();


            res.json({

                message:
                    "Deposit approved successfully"

            });


        } catch (error) {

            console.error(
                "Approve deposit error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to approve deposit"
            });
        }
    }
);


// =====================================================
// Reject Deposit Request
// ADMIN ONLY
// =====================================================
router.put(
    "/deposit-requests/:id/reject",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const request =
                await DepositRequest.findById(
                    req.params.id
                );


            if (!request) {

                return res.status(404).json({
                    message:
                        "Deposit request not found"
                });
            }


            // Already processed
            if (
                request.status !==
                "pending"
            ) {

                return res.status(400).json({
                    message:
                        "Request already processed"
                });
            }


            // Reject
            request.status =
                "rejected";


            await request.save();


            res.json({

                message:
                    "Deposit request rejected"

            });


        } catch (error) {

            console.error(
                "Reject deposit error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to reject deposit"
            });
        }
    }
);


module.exports = router;