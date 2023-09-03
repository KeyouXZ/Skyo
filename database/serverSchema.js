const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
    serverId: {
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
    goodbyeMessage: {
        type: String,
        default: ""
    },
    goodbyeChannel: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("Servers", serverSchema)