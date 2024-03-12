const mongoose = require("mongoose");

const user = new mongoose.Schema({
    // Login information
    ID: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // Essential
    isDeveloper: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    
    // Premium
    premiumDate: {
        type: Date,
        default: 0
    },
    premiumDuration: {
        type: Number,
        default: 0
    },
    
    // Level
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    
    // Economy
    wallet: {
        type: Number,
        default: 100
    },
    bank: {
        type: Number,
        default: 0
    }
})

const userSchema = mongoose.model("TmpUsers", user)

module.exports = { userSchema }