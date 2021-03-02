const mongoose = require('mongoose');

const PointsReceiptSchema = mongoose.Schema({
    Type: {
        type: String,
        required: true
    }, // Types include manual_change, points_request, event_direct
    Status: {
        type: String,
        required: true
    },
    PointsType: {
        type: String,
        required: true
    },
    SubmissionDate: {
        type: Date,
        default: Date.Now
    },
    ApprovedDate: {
        type: Date
    },
    Recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true
    },
    PointsChange: {
        type: Number
    },
    Approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile"
    },
    RequestDetails: {
        AssociatedEventTimeSlots: {
            Slots: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: "TimeSlots"
            },
            IsAssociatedToSlots: {
                type: Boolean,
                required: true
            }
        },
        AssociatedEvent: {
            Event: {
                type: mongoose.Schema.Types.ObjectId,
                ref: ""
            },
            IsAssociatedToEvent: {
                type: Boolean,
                required: true
            }
        },
        AssociatedSheet: {
            Sheet: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SignupSheet"
            },
            IsAssociatedToSheet: {
                type: Boolean,
                required: true
            }
        },
        Description: {
            type: String,
            required: true
        }
    }
});

module.exports = mongoose.model('PointsReceipt', PointsReceiptSchema);