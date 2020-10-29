const mongoose = require('mongoose');

const PendingEmailNotificationSchema = mongoose.Schema({
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
    EmailTemplate: {
        type: String,
        required: true
    },
    EmailSubject: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('PendingEmailNotification', PendingEmailNotificationSchema);