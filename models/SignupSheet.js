const mongoose = require('mongoose');

const SignupSheetSchema = mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    CanViewResponses: {
        type: [{
            UserId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            DateSet: {
                type: Date,
                default: Date.Now
            }
        }]
    },
    CanFill: {
        type: [{
            UserId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            DateSet: {
                type: Date,
                default: Date.Now
            }
        }]
    },
    Completed: {
        type: [{
            UserId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            DateCompleted: {
                type: Date,
                default: Date.Now
            }
        }]
    },
    NotCompleted: {
        type: [{
            UserId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            DateAsigned: {
                type: Date,
                default: Date.Now
            }
        }]
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
            Required: {
                type: Boolean,
                required: true
            },            
            UsesTimeSlots: {
                type: Boolean
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