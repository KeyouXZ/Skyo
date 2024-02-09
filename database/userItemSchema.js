const mongoose = require("mongoose");

const userItemSchema = new mongoose.Schema({
    userID: {
        type: String,
        require: true
    },
    item: {
        type: Object,
        default: {
            "1": 0,
            "2": 0,
            "3": 0,
        }
    },
    effect: {
        type: Object
    },
});

module.exports = mongoose.model("userItem", userItemSchema)