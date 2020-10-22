const mongoose = require('mongoose');

const SignupSheetSchema = mongoose.Schema({
    Create: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    CanViewResponses: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    CanFill: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    Completed: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    NotCompleted: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    Description: {
        type: String
    },
    ExpiryDate: {
        type: Date,
        required: true
    },
    Fields: {
        type: [{
            FieldName: {
                type: String,
                required: true
            },
            ResponseType: {
                type: String,
                required: true
            },            
            UsesTimeSlots: {
                type: Boolean,
                required: true
            },
            AvailableTimeSlots: {
                type: [{
                    StartTime: {
                        type: Date,
                        required: true
                    },
                    EndTime: {
                        type: Date,
                        required: true
                    }
                }]
            }
        }]
    }
});

module.exports = mongoose.model('SignupSheets', SignupSheetSchema);