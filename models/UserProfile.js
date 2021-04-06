const mongoose = require('mongoose');

const MemberProfileSchema = mongoose.Schema({

    Approved: {
        type: Boolean,
        default: false
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
        isPresident: {
            type: Boolean,
            default: false
        }
    },
    Points: {
        SocialPoints: {
            type: Number,
            default: 0
        },
        WorkPoints: {
            type: Number,
            default: 0
        }
    },
    MembershipStatus: {
        type: String,
        default: "active"
    },
    HashedPassword: {
        type: String,
        required: true
    },
    ProfilePicture: {
        Filename: {
            type: String,
            required: true 
        }, 
        Path: {
            type: String,
            required: true
        },        
        ImageType: {
            type: String,
            required: true
        },
        Size: {
            type: Number
        },
        GCImageID: {
            type: String
        }
    }
});

module.exports = mongoose.model('MemberProfiles', MemberProfileSchema);