const mongoose = require('mongoose');

const FulfilledEmailNotificationSchema = mongoose.Schema({
    TargetUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    AssociatedSheet: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    AssociatedResponse: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ExpectedDate: {
        type: Date,
        required: true
    },
    FulfilledDate: {
        type: Date,
        required: true
    },
    EmailTemplate: {
        type: String,
        required: true
    },
    EmailSubject: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('FulfilledEmailNotification', FulfilledEmailNotificationSchema);