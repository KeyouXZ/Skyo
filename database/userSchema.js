const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    blacklist: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
     },
    isDeveloper: {
        type: Boolean,
        default: false    
    },
    premiumDate: {
        type: Date
    },
    premiumDuration: {
        type: Number
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    wallet: {
        type: Number,
        default: 100
    },
    bank: {
        type: Number,
        default: 0
    },
    lastDaily: {
		type: Number,
		default: 0
	},
    lastWeekly: {
		type: Number,
		default: 0
	}
});

const userSchemaData = mongoose.model("Users", userSchema)

module.exports = userSchemaData; //mongoose.model('Users', userSchema);