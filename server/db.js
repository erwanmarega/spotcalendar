const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'spotcalendar.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    email_notifications INTEGER DEFAULT 0,
    last_email_sent TEXT
  )
`);

module.exports = db;
