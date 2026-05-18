const db = require('../config/db');

const TimeSlot = {
  getAll(callback) {
    db.query(
      `SELECT time_slots.*, daily_schedules.date
       FROM time_slots
       LEFT JOIN daily_schedules ON time_slots.daily_schedule_id = daily_schedules.id`,
      callback
    );
  },

  findById(id, callback) {
    db.query('SELECT * FROM time_slots WHERE id = ?', [id], callback);
  },

  create(data, callback) {
    db.query(
      'INSERT INTO time_slots (daily_schedule_id, start_time, end_time) VALUES (?, ?, ?)',
      [data.daily_schedule_id, data.start_time, data.end_time],
      callback
    );
  },

  update(id, data, callback) {
    db.query(
      'UPDATE time_slots SET daily_schedule_id = ?, start_time = ?, end_time = ? WHERE id = ?',
      [data.daily_schedule_id, data.start_time, data.end_time, id],
      callback
    );
  },

  delete(id, callback) {
    db.query('DELETE FROM time_slots WHERE id = ?', [id], callback);
  }
};

module.exports = TimeSlot;