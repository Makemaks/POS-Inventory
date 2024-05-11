const mongoose = require('mongoose');

const dailyScheduleSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const DailySchedule = mongoose.model('DailySchedule', dailyScheduleSchema);

module.exports = DailySchedule;
