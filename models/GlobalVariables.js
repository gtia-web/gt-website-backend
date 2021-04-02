const mongoose = require('mongoose');

const GlobalVariablesSchema = mongoose.Schema({
    SocialPointsRequirement: {
        type: Number,
        required: true
    },
    WorkPointsRequirement: {
        type: Number,
        required: true
    },
    Semester: {
        type: String,
        required: true
    },
    SemesterStart: {
        type: Date,
        required: true
    },
    SemesterEnd: {
        type: Date,
        required: true
    },
    GeneralMeetingTime: {
        type: String,
        required: true
    },
    GeneralMeetingDay: {
        type: String,
        required: true
    },
    AutoGeneralMeetingEvent: {
        type: Boolean,
        required: true
    }


});

module.exports = mongoose.model('GlobalVariables', GlobalVariablesSchema);