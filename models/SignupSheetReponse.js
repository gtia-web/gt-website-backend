const mongoose = require('mongoose');

const SignupSheetReponsesSchema = mongoose.Schema({
    SignupSheet: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    IsPending: {
        type: Boolean,
        default: true
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
                type: mongoose.Schema.Types.ObjectId
            },
            IsTimeSlotChosen: {
                StartTime: {
                    type: Date
                },
                EndTime: {
                    type: Date
                }
            },
            Response: {
                type: Schema.Types.Mixed
            }
        }]
    }
});

module.exports = mongoose.model('SignupSheetResponses', SignupSheetReponsesSchema);