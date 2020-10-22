const mongoose = require('mongoose');

const PointsRequestSchema = mongoose.Schema({
    Approver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    Requester: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    SubmissionDate: {
        type: Date,
        default: Date.Now
    },
    PointsType: {
        type: String,
        required: true
    },
    ApprovedDate: {
        type: Date
    },
    PointsGiven: {
        type: Number
    },
    IsPending: {
        type: Boolean,
        default: true
    },
    RequestDetails: {
        EventName: {
            type: Number,
            required: true
        },
        Description: {
            type: String
        },
        DateOfEvent: {
            type: Date
        },
        ShiftsCovered: {
            type: Number,
            required: true
        }
    }
});

module.exports = mongoose.model('PointsRequests', PointsRequestSchema);