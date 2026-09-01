const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    description: String,

    type: {
        type: String,
        enum: ["credit", "debit"]
    },

    amount: Number,

    date: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    accountNumber: {
        type: String,
        unique: true
    },

    balance: {
        type: Number,
        default: 0
    },

    transactions: [transactionSchema]

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);