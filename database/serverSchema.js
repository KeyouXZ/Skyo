const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
    serverID: {
        type: String,
        require: true
    },
    welcomeMessage: {
        type: String,
        default: ""
    },
    welcomeChannel: {
        type: String,
        default: ""
    },
    welcomeEnable: {
        type: Boolean,
        default: false
    },
    goodbyeMessage: {
        type: String,
        default: ""
    },
    goodbyeChannel: {
        type: String,
        default: ""
    },
    goodbyeEnable: {
        type: Boolean,
        default: false
    },
    reactionrole: [{
        type: Object
    }]
});

module.exports = mongoose.model("Servers", serverSchema)