const express = require("express");
const User = require("../models/user");
const authenticateToken = require("../middleware/authmiddleware");

const router = express.Router();

router.get("/dashboard", authenticateToken, async (req, res) => {
try {
const user = await User.findById(req.userId).select("-password");

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
            .sort((a, b) => b.date - a.date)
            .slice(0, 5)
    });

} catch (error) {
    res.status(500).json({
        message: "Failed to fetch account details"
    });
}

});

module.exports = router;
