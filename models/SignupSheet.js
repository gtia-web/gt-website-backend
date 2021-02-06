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
    SendEmailNotifications: {
        type: Boolean,
        required: true
    },
    TextFields: {
        type: [{
            Question: {
                type: String,
                required: true
            },
            Required: {
                type: Boolean,
                required: true
            },
            FieldNumber: {
                type: Number,
                required: true
            }
        }]
    }, 
    OptionsFields: {
        type: [{
            Question: {
                type: String,
                required: true
            },
            Required: {
                type: Boolean,
                required: true
            },
            ChooseMultiple: {
                type: Boolean,
                required: true
            },            
            FieldNumber: {
                type: Number,
                required: true
            },
            Options: {
                type: [{
                    OptionNumber: {
                        type: Number,
                        required: true
                    },
                    Option: {
                        type: String,
                        required: true
                    }

                }],
            }

        }]
    },           
    TimeSlotsFields: {
        type: [{
            ShortDecrip: {
                type: String,
                required: true
            },             
            FieldNumber: {
                type: Number,
                required: true
            },
            JobType: {
                type: String,
                required: true
            },           
            Required: {
                type: Boolean,
                required: true
            },
            StartTime: {
                type: Date,
                required: true
            },
            EndTime: {
                type: Date,
                required: true
            },
            Length: {
                type: Number,
                required: true
            }           
        }]
    }   
});

module.exports = mongoose.model('SignupSheets', SignupSheetSchema);