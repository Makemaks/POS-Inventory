const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    dailyScheduleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailySchedule'
    },
    startTime: Date,
    endTime: Date
});

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

module.exports = TimeSlot;
