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
    goodbyeMessage: {
        type: String,
        default: ""
    },
    goodbyeChannel: {
        type: String,
        default: ""
    },
    reactionrole: [{
        type: Object
    }]
});

module.exports = mongoose.model("Servers", serverSchema)