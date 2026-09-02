const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const DepositRequest = require("../models/depositRequest");
const ProfileUpdateRequest =
    require("../models/profileUpdateRequest");
const authenticateToken = require("../middleware/authmiddleware");

const router = express.Router();


// =====================================================
// ADMIN CHECK
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
// CUSTOMER CHECK
// =====================================================

function requireCustomer(req, res, next) {

    if (req.role === "admin") {
        return res.status(403).json({
            message: "Customer access required"
        });
    }

    next();
}


// =====================================================
// CUSTOMER DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    authenticateToken,
    requireCustomer,
    async (req, res) => {

        try {

            const user = await User.findById(req.userId)
                .select("-password");

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (user.status === "suspended") {
                return res.status(403).json({
                    message: "Your account has been suspended"
                });
            }

            const transactions = [...user.transactions]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )
                .slice(0, 5);

            res.json({

                name: user.name,

                accountNumber:
                    user.accountNumber,

                balance:
                    user.balance,

                status:
                    user.status,

                transactions
            });

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch account details"
            });
        }
    }
);


// =====================================================
// MONEY TRANSFER
// Account Number OR Phone Number
// =====================================================

router.post(
    "/transfer",
    authenticateToken,
    requireCustomer,
    async (req, res) => {

        try {

            const {
                recipientAccountNumber,
                amount
            } = req.body;


            // -----------------------------------------
            // Validate recipient
            // -----------------------------------------

            if (!recipientAccountNumber) {

                return res.status(400).json({
                    message:
                        "Recipient account number or phone is required"
                });
            }


            // -----------------------------------------
            // Validate amount
            // -----------------------------------------

            const transferAmount =
                Number(amount);

            if (
                !Number.isFinite(transferAmount) ||
                transferAmount <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Transfer amount must be greater than 0"
                });
            }


            // -----------------------------------------
            // Find sender
            // -----------------------------------------

            const sender =
                await User.findById(req.userId);


            if (!sender) {

                return res.status(404).json({
                    message:
                        "Sender account not found"
                });
            }


            if (sender.status === "suspended") {

                return res.status(403).json({
                    message:
                        "Your account has been suspended"
                });
            }


            // -----------------------------------------
            // Find recipient
            // Account number OR phone
            // -----------------------------------------

            const recipientUser =
                await User.findOne({

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


            if (!recipientUser) {

                return res.status(404).json({
                    message:
                        "Recipient does not have a Valora account"
                });
            }


            // -----------------------------------------
            // Prevent self transfer
            // -----------------------------------------

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


            // -----------------------------------------
            // Check recipient status
            // -----------------------------------------

            if (
                recipientUser.status ===
                "suspended"
            ) {

                return res.status(400).json({
                    message:
                        "Recipient account is suspended"
                });
            }


            // -----------------------------------------
            // Check balance
            // -----------------------------------------

            if (
                Number(sender.balance) <
                transferAmount
            ) {

                return res.status(400).json({
                    message:
                        "Insufficient balance"
                });
            }


            // -----------------------------------------
            // Deduct sender balance
            // -----------------------------------------

            sender.balance -=
                transferAmount;


            // -----------------------------------------
            // Add recipient balance
            // -----------------------------------------

            recipientUser.balance +=
                transferAmount;


            // -----------------------------------------
            // Sender transaction
            // -----------------------------------------

            sender.transactions.push({

                description:
                    `Transfer to ${recipientUser.name}`,

                type:
                    "debit",

                amount:
                    transferAmount

            });


            // -----------------------------------------
            // Recipient transaction
            // -----------------------------------------

            recipientUser.transactions.push({

                description:
                    `Received from ${sender.name}`,

                type:
                    "credit",

                amount:
                    transferAmount

            });


            // -----------------------------------------
            // Save
            // -----------------------------------------

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
    }
);


// =====================================================
// DIRECT DEPOSIT
// =====================================================

router.post(
    "/deposit",
    authenticateToken,
    requireCustomer,
    async (req, res) => {

        try {

            const depositAmount =
                Number(req.body.amount);


            if (
                !Number.isFinite(depositAmount) ||
                depositAmount <= 0
            ) {

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


            if (user.status === "suspended") {

                return res.status(403).json({
                    message:
                        "Your account has been suspended"
                });
            }


            user.balance +=
                depositAmount;


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
    }
);


// =====================================================
// CREATE DEPOSIT REQUEST
// =====================================================

router.post(
    "/deposit-request",
    authenticateToken,
    requireCustomer,
    async (req, res) => {

        try {

            const {
                amount,
                reason
            } = req.body;


            const depositAmount =
                Number(amount);


            if (
                !Number.isFinite(depositAmount) ||
                depositAmount <= 0
            ) {

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


            if (user.status === "suspended") {

                return res.status(403).json({
                    message:
                        "Your account has been suspended"
                });
            }


            // -----------------------------------------
            // Only one pending request
            // -----------------------------------------

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


            // -----------------------------------------
            // Create request
            // -----------------------------------------

            const request =
                await DepositRequest.create({

                    user:
                        req.userId,

                    amount:
                        depositAmount,

                    reason:
                        reason?.trim() ||
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
// ADMIN - PENDING DEPOSIT REQUESTS
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
                    "name email phone accountNumber status"
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
// ADMIN - APPROVE DEPOSIT
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


            if (
                customer.status ===
                "suspended"
            ) {

                return res.status(400).json({
                    message:
                        "Customer account is suspended"
                });
            }


            const depositAmount =
                Number(request.amount);


            customer.balance +=
                depositAmount;


            customer.transactions.push({

                description:
                    "Deposit approved by admin",

                type:
                    "credit",

                amount:
                    depositAmount

            });


            await customer.save();


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
// ADMIN - REJECT DEPOSIT
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


            if (
                request.status !==
                "pending"
            ) {

                return res.status(400).json({
                    message:
                        "Request already processed"
                });
            }


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


// =====================================================
// ADMIN - GET ALL USERS
// =====================================================

router.get(
    "/admin/users",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const users =
                await User.find({})
                    .select("-password")
                    .sort({
                        createdAt: -1
                    });


            res.json(users);


        } catch (error) {

            console.error(
                "Fetch users error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch users"
            });
        }
    }
);


// =====================================================
// ADMIN - STATISTICS
// =====================================================

router.get(
    "/admin/stats",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const users =
                await User.find({})
                    .select(
                        "balance status transactions"
                    );


            const totalUsers =
                users.length;


            const activeUsers =
                users.filter(
                    user =>
                        user.status === "active"
                ).length;


            const suspendedUsers =
                users.filter(
                    user =>
                        user.status === "suspended"
                ).length;


            let totalBalance = 0;

            let totalTransactions = 0;

            let totalCredits = 0;

            let totalDebits = 0;


            users.forEach(user => {

                totalBalance +=
                    Number(
                        user.balance || 0
                    );


                if (
                    user.transactions &&
                    user.transactions.length
                ) {

                    totalTransactions +=
                        user.transactions.length;


                    user.transactions.forEach(
                        transaction => {

                            const transactionAmount =
                                Number(
                                    transaction.amount || 0
                                );


                            if (
                                transaction.type ===
                                "credit"
                            ) {

                                totalCredits +=
                                    transactionAmount;
                            }


                            if (
                                transaction.type ===
                                "debit"
                            ) {

                                totalDebits +=
                                    transactionAmount;
                            }

                        }
                    );
                }

            });


            const pendingRequests =
                await DepositRequest.countDocuments({
                    status: "pending"
                });


            res.json({

                totalUsers,

                activeUsers,

                suspendedUsers,

                totalBalance,

                totalCredits,

                totalDebits,

                totalTransactions,

                pendingRequests

            });


        } catch (error) {

            console.error(
                "Admin statistics error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch admin statistics"
            });
        }
    }
);


// =====================================================
// ADMIN - SINGLE USER DETAILS
// =====================================================

router.get(
    "/admin/users/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                )
                .select("-password");


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            res.json(user);


        } catch (error) {

            console.error(
                "User details error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch user details"
            });
        }
    }
);


// =====================================================
// ADMIN - CREATE USER
// =====================================================

router.post(
    "/admin/users",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                name,
                email,
                phone,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !phone ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "All fields are required"
                });
            }


            if (password.length < 6) {

                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters"
                });
            }


            const existingUser =
                await User.findOne({

                    $or: [
                        { email },
                        { phone }
                    ]

                });


            if (existingUser) {

                return res.status(400).json({
                    message:
                        "User already exists with this email or phone"
                });
            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // -----------------------------------------
            // Generate unique account number
            // -----------------------------------------

            let accountNumber;

            do {

                accountNumber =
                    Math.floor(
                        100000000000 +
                        Math.random() *
                        900000000000
                    ).toString();

            } while (
                await User.findOne({
                    accountNumber
                })
            );


            const user =
                await User.create({

                    name:
                        name.trim(),

                    email:
                        email.trim().toLowerCase(),

                    phone:
                        phone.trim(),

                    password:
                        hashedPassword,

                    accountNumber,

                    balance:
                        0,

                    status:
                        "active"

                });


            res.status(201).json({

                message:
                    "User created successfully",

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    accountNumber:
                        user.accountNumber

                }

            });


        } catch (error) {

            console.error(
                "Create user error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to create user"
            });
        }
    }
);


// =====================================================
// ADMIN - UPDATE USER
// =====================================================

router.put(
    "/admin/users/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                name,
                email,
                phone
            } = req.body;


            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            // -----------------------------------------
            // Check email uniqueness
            // -----------------------------------------

            if (
                email &&
                email !== user.email
            ) {

                const existingEmail =
                    await User.findOne({

                        email:
                            email.trim().toLowerCase(),

                        _id: {
                            $ne:
                                req.params.id
                        }

                    });


                if (existingEmail) {

                    return res.status(400).json({
                        message:
                            "Email already in use"
                    });
                }
            }


            // -----------------------------------------
            // Check phone uniqueness
            // -----------------------------------------

            if (
                phone &&
                phone !== user.phone
            ) {

                const existingPhone =
                    await User.findOne({

                        phone:
                            phone.trim(),

                        _id: {
                            $ne:
                                req.params.id
                        }

                    });


                if (existingPhone) {

                    return res.status(400).json({
                        message:
                            "Phone already in use"
                    });
                }
            }


            if (name !== undefined) {

                user.name =
                    name.trim();
            }


            if (email !== undefined) {

                user.email =
                    email.trim().toLowerCase();
            }


            if (phone !== undefined) {

                user.phone =
                    phone.trim();
            }


            await user.save();


            res.json({

                message:
                    "User updated successfully"

            });


        } catch (error) {

            console.error(
                "Update user error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update user"
            });
        }
    }
);


// =====================================================
// ADMIN - SUSPEND USER
// =====================================================

router.put(
    "/admin/users/:id/suspend",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            user.status =
                "suspended";


            await user.save();


            res.json({

                message:
                    "User account suspended"

            });


        } catch (error) {

            console.error(
                "Suspend user error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to suspend user"
            });
        }
    }
);


// =====================================================
// ADMIN - ACTIVATE USER
// =====================================================

router.put(
    "/admin/users/:id/activate",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            user.status =
                "active";


            await user.save();


            res.json({

                message:
                    "User account activated"

            });


        } catch (error) {

            console.error(
                "Activate user error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to activate user"
            });
        }
    }
);


// =====================================================
// ADMIN - DELETE USER
// =====================================================

router.delete(
    "/admin/users/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            await User.findByIdAndDelete(
                req.params.id
            );


            await DepositRequest.deleteMany({
                user:
                    req.params.id
            });


            res.json({

                message:
                    "User deleted successfully"

            });


        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to delete user"
            });
        }
    }
);


// =====================================================
// ADMIN - RESET USER PASSWORD
// =====================================================

router.put(
    "/admin/users/:id/reset-password",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                newPassword
            } = req.body;


            if (
                !newPassword ||
                newPassword.length < 6
            ) {

                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters"
                });
            }


            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            user.password =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            await user.save();


            res.json({

                message:
                    "User password reset successfully"

            });


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to reset password"
            });
        }
    }
);


// =====================================================
// ADMIN - ALL TRANSACTIONS
// =====================================================

router.get(
    "/admin/transactions",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const users =
                await User.find({})
                    .select(
                        "name accountNumber transactions"
                    );


            const transactions = [];


            users.forEach(user => {

                if (
                    user.transactions &&
                    user.transactions.length
                ) {

                    user.transactions.forEach(
                        transaction => {

                            transactions.push({

                                userId:
                                    user._id,

                                userName:
                                    user.name,

                                accountNumber:
                                    user.accountNumber,

                                description:
                                    transaction.description,

                                type:
                                    transaction.type,

                                amount:
                                    transaction.amount,

                                date:
                                    transaction.date,

                                highValue:
                                    Number(
                                        transaction.amount
                                    ) >= 100000

                            });

                        }
                    );
                }

            });


            transactions.sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


            res.json(transactions);


        } catch (error) {

            console.error(
                "Transaction monitoring error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch transactions"
            });
        }
    }
);


// =====================================================
// CUSTOMER FEEDBACK
// =====================================================

router.post(
    "/feedback",
    authenticateToken,
    requireCustomer,
    async (req, res) => {

        try {

            const {
                message,
                rating
            } = req.body;


            if (
                !message ||
                !message.trim()
            ) {

                return res.status(400).json({
                    message:
                        "Feedback message is required"
                });
            }


            const user =
                await User.findById(
                    req.userId
                );


            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            if (user.status === "suspended") {

                return res.status(403).json({
                    message:
                        "Your account has been suspended"
                });
            }


            /*
             * Currently feedback is stored
             * as a zero-value transaction record.
             *
             * A dedicated Feedback model can
             * replace this later.
             */

            user.transactions.push({

                description:
                    `Feedback: ${message.trim()}`,

                type:
                    "credit",

                amount:
                    0

            });


            await user.save();


            res.status(201).json({

                message:
                    "Thank you! Your feedback has been submitted."

            });


        } catch (error) {

            console.error(
                "Feedback error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to submit feedback"
            });
        }
    }
);
// =====================================================
// CUSTOMER - PROFILE UPDATE REQUEST
// =====================================================

router.post(
    "/profile-update-request",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                requestedChanges,
                reason
            } = req.body;

            // Check that at least one actual profile
            // detail was provided
            if (
                !requestedChanges ||
                Object.keys(requestedChanges).length === 0
            ) {
                return res.status(400).json({
                    message:
                        "Please provide at least one detail to update"
                });
            }

            const existingRequest =
                await ProfileUpdateRequest.findOne({
                    user: req.userId,
                    status: "pending"
                });

            if (existingRequest) {
                return res.status(400).json({
                    message:
                        "You already have a pending update request"
                });
            }

            const request =
                await ProfileUpdateRequest.create({

                    user: req.userId,

                    requestedChanges: requestedChanges,

                    reason:
                        reason || "Profile update request",

                    status: "pending"
                });

            res.status(201).json({

                message:
                    "Profile update request submitted successfully",

                requestId:
                    request._id
            });

        } catch (error) {

            console.error(
                "Profile update request error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to submit profile update request"
            });
        }
    }
);
// =====================================================
// ADMIN - GET PROFILE UPDATE REQUESTS
// =====================================================

router.get(
    "/profile-update-requests",
    authenticateToken,
    async (req, res) => {

        try {

            const admin = await User.findById(req.userId);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({
                    message: "Admin access required"
                });
            }

            const requests =
                await ProfileUpdateRequest.find({
                    status: "pending"
                })
                .populate(
                    "user",
                    "name email phone accountNumber"
                )
                .sort({ createdAt: -1 });

            res.json(requests);

        } catch (error) {

            console.error(
                "Profile update requests error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to load profile update requests"
            });
        }
    }
);// =====================================================
// ADMIN - APPROVE PROFILE UPDATE
// =====================================================

router.put(
    "/profile-update-requests/:id/approve",
    authenticateToken,
    async (req, res) => {

        try {

            const admin = await User.findById(req.userId);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({
                    message: "Admin access required"
                });
            }

            const request =
                await ProfileUpdateRequest.findById(
                    req.params.id
                );

            if (!request) {
                return res.status(404).json({
                    message: "Request not found"
                });
            }

            if (request.status !== "pending") {
                return res.status(400).json({
                    message: "Request already processed"
                });
            }

            const user =
                await User.findById(request.user);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const changes =
                request.requestedChanges;

            if (changes.name) {
                user.name = changes.name;
            }

            if (changes.email) {
                user.email =
                    changes.email.toLowerCase();
            }

            if (changes.phone) {
                user.phone = changes.phone;
            }

            await user.save();

            request.status = "approved";

            await request.save();

            res.json({
                message:
                    "Profile update approved successfully"
            });

        } catch (error) {

            console.error(
                "Approve profile update error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to approve profile update"
            });
        }
    }
);// =====================================================
// ADMIN - REJECT PROFILE UPDATE
// =====================================================

router.put(
    "/profile-update-requests/:id/reject",
    authenticateToken,
    async (req, res) => {

        try {

            const admin = await User.findById(req.userId);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({
                    message: "Admin access required"
                });
            }

            const request =
                await ProfileUpdateRequest.findById(
                    req.params.id
                );

            if (!request) {
                return res.status(404).json({
                    message: "Request not found"
                });
            }

            if (request.status !== "pending") {
                return res.status(400).json({
                    message: "Request already processed"
                });
            }

            request.status = "rejected";

            await request.save();

            res.json({
                message:
                    "Profile update rejected successfully"
            });

        } catch (error) {

            console.error(
                "Reject profile update error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to reject profile update"
            });
        }
    }
);
module.exports = router;