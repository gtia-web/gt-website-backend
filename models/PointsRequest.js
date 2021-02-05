const mongoose = require('mongoose');

const PointsRequestSchema = mongoose.Schema({
    approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile"
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true
    },
    submissionDate: {
        type: Date,
        default: Date.Now
    },
    pointsType: {
        type: String,
        required: true
    },
    approvedDate: {
        type: Date
    },
    pointsGiven: {
        type: Number
    },
    isPending: {
        type: Boolean,
        default: true
    },
    requestDetails: {
        eventName: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        dateOfEvent: {
            type: Date
        },
        shiftsCovered: {
            type: Number,
            required: true
        }
    }
});

module.exports = mongoose.model('PointsRequests', PointsRequestSchema);