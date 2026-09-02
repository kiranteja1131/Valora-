const mongoose = require("mongoose");

// =====================================================
// TRANSACTION SCHEMA
// =====================================================

const transactionSchema = new mongoose.Schema({

    description: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }

});


// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema({

    // -------------------------------------------------
    // Basic Information
    // -------------------------------------------------

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },


    // -------------------------------------------------
    // Banking Information
    // -------------------------------------------------

    accountNumber: {
        type: String,
        unique: true
    },

    balance: {
        type: Number,
        default: 0,
        min: 0
    },


    // -------------------------------------------------
    // Account Status
    // -------------------------------------------------

    status: {
        type: String,

        enum: [
            "active",
            "suspended"
        ],

        default: "active"
    },


    // -------------------------------------------------
    // User Role
    // -------------------------------------------------

    role: {
        type: String,

        enum: [
            "customer",
            "admin",
            "teller"
        ],

        default: "customer"
    },


    // -------------------------------------------------
    // Transactions
    // -------------------------------------------------

    transactions: [
        transactionSchema
    ]

}, {

    timestamps: true

});


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports =
    mongoose.model("User", userSchema);