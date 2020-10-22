const mongoose = require('mongoose');

const MemberProfileSchema = mongoose.Schema({

    PendingApproval: {
        type: Boolean,
        default: true
    },
    Username: {
        type: String,
        required: true
    },
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    MiddleName: {
        type: String,
        default: ""
    },
    Email: {
        type: String,
        required: true
    },
    Committee: {
        type: String,
        required: true
    },
    Subcommittee: {
        type: String
    },
    SpecialPermissions: {
        type: [String],
        default: []
    },
    VPStatus: {
        isVP: {
            type: Boolean,
            default: false
        },
        Position: {
            type: String
        }
    },
    Point: {
        SocialPoints: {
            type: Number,
            default: 0
        },
        WorkPoints: {
            type: Number,
            default: 0
        },
        PendingPoints: {
            _id: {
                type: [mongoose.Schema.Types.ObjectId]
            }
        }
    },
    MembershipStatus: {
        type: String,
        default: "active"
    },
    HashedPassword: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('MemberProfiles', MemberProfileSchema);