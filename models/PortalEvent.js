const mongoose = require('mongoose');

const PortalEventSchema = mongoose.Schema({
    
    CreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true
    },
    EventName: {
        type: String,
        required: true
    },
    Location: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    StartTime: {
        type: Date,
        required: true
    },
    EndTime: {
        type: Date,
        required: true
    },    
    EventType: {
        type: String,
        required: true
    },
    Notifications: {
        NotificationNote: {
            type: String
        },
        NotificationTimeLine: {
            type: [Date]
        }
    },
    AccessibleBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "UserProfile",
        required: true
    },
    AvailableToEveryone: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('PortalEvent', PortalEventSchema);