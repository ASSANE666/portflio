const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new Database(dbPath);

// Initialize DB
function initDb() {
    // Visitors table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip TEXT,
            userAgent TEXT
        )
    `).run();

    // Downloads table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS downloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip TEXT,
            fileName TEXT
        )
    `).run();
}

module.exports = {
    db,
    initDb
};
