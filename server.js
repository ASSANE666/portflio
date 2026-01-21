const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

const app = express();
const PORT = 3000;

// Initialize DB
initDb();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to log visits automatically? 
// No, let's make it an explicit API call from client side to differentiate "page load" from "bot" maybe, 
// OR just log every request to / ? 
// User wants to track "people who entered". Logging root request is easiest.
// But since we serve static files, we can just intercept the GET / request.
// However, 'express.static' handles it.
// Let's add a robust approach: client side JS calls /api/visit.

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

// API: Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user && bcrypt.compareSync(password, user.password)) {
        res.json({ success: true, token: 'admin-token-secret' }); // Simple token for this demo
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// API: Get Stats
app.get('/api/stats', (req, res) => {
    const token = req.headers['authorization'];
    if (token !== 'admin-token-secret') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const visitCount = db.prepare('SELECT COUNT(*) as count FROM visitors').get().count;
        const downloadCount = db.prepare('SELECT COUNT(*) as count FROM downloads').get().count;

        const recentVisits = db.prepare('SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 50').all();
        const recentDownloads = db.prepare('SELECT * FROM downloads ORDER BY timestamp DESC LIMIT 50').all();

        res.json({
            visitCount,
            downloadCount,
            recentVisits,
            recentDownloads
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
