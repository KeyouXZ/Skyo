const mongoose = require("mongoose");

const serverSchema = new mongoose.schema({
    serverId: {
        type: String,
        require: true
    },
    welcomeMsg: {
        type: String,
        default: ""
    },
    welcomeChannel: {
        type: String,
        default: ""
    },
    goodbyeMsg: {
        type: String,
        default: ""
    },
    goodbyeChannel: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("Servers", serverSchema)