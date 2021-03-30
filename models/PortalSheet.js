const mongoose = require('mongoose');

const PortalSheetSchema = mongoose.Schema({
    
    CreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    Title: {
        type: String,
        required: true
    },
    Source: {
        type: String,
        required: true
    },
    SheetURL: {
        type: String,
        required: true
    },
    Tags: {
        type: [String],
        required: true
    },
    CreationDate: {
        type: Date,
        required: true
    },
    AccessibleBy: {
        type: [{
            User: {
                type: mongoose.Schema.Types.ObjectId,
                require: true
            },
            OpenedDate: {
                type: Date
            }
        }],
        ref: "UserProfile",
        required: true
    },
    VisibleOn: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('PortalSheet', PortalSheetSchema);