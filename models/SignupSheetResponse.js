const mongoose = require('mongoose');

const SignupSheetReponsesSchema = mongoose.Schema({
    SignupSheet: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    FilledBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    FilledDate: {
        type: Date,
        default: new Date()
    },
    AssignedDate: {
        type: Date
    },
    Fields: {
        type: [String]
    },
    UsesTimeSlots: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('SignupSheetResponses', SignupSheetReponsesSchema);