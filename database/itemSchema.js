const mongoose = require("mongoose")

const itemScema = new mongoose.Schema ({
    id: {
        type: Number,
        require: true
    },
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
    },
    type: [{
        type: Number
    }],
    rarity: {
        type: Number,
        default: 6
    },
    buyAble: {
        type: Boolean,
        default: false
    },
    sellAble: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0
    },
    effect: [{
        type: String
    }],
    effectDuration: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("Item", itemScema)