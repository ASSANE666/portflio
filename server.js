const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DB
initDb();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Record Visit
app.post('/api/visit', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    try {
        db.prepare('INSERT INTO visitors (ip, userAgent) VALUES (?, ?)').run(ip, userAgent);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// API: Record Download
app.post('/api/download', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { fileName } = req.body;
    try {
        db.prepare('INSERT INTO downloads (ip, fileName) VALUES (?, ?)').run(ip, fileName || 'unknown');
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
