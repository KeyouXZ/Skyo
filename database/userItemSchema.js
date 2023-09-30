const mongoose = require("mongoose");

const userItemSchema = new mongoose.Schema({
    item: {
        type: Object,
        default: {
            "1": 0,
            "2": 0,
            "3": 0,
        }
    }
});

module.exports = mongoose.model("userItem", userItemSchema)