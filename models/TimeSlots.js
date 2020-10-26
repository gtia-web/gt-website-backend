const mongoose = require('mongoose');

const TimeSlotsSchema = mongoose.Schema({
    AssociatedSignupSheet: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    AssociatedUser: mongoose.Schema.Types.ObjectId,
    AssociatedResponse: mongoose.Schema.Types.ObjectId,
    IsUsed: {
        type: Boolean,
        default: false
    },
    JobType: {
        type: String,
        required: true
    },
    StartTime: {
        type: Date,
        required: true
    },
    EndTime: {
        type: Date,
        required: true
    }
});


module.exports = mongoose.model('TimeSlots', TimeSlotsSchema);