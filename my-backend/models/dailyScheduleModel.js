const db = require('../config/db');

const DailySchedule = {
  getAll(callback) {
    db.query(
      `SELECT daily_schedules.*, users.name AS user_name
       FROM daily_schedules
       LEFT JOIN users ON daily_schedules.user_id = users.id`,
      callback
    );
  },

  findById(id, callback) {
    db.query('SELECT * FROM daily_schedules WHERE id = ?', [id], callback);
  },

  create(data, callback) {
    db.query(
      'INSERT INTO daily_schedules (user_id, date) VALUES (?, ?)',
      [data.user_id, data.date],
      callback
    );
  },

  update(id, data, callback) {
    db.query(
      'UPDATE daily_schedules SET user_id = ?, date = ? WHERE id = ?',
      [data.user_id, data.date, id],
      callback
    );
  },

  delete(id, callback) {
    db.query('DELETE FROM daily_schedules WHERE id = ?', [id], callback);
  }
};

module.exports = DailySchedule;