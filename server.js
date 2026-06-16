require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const dbHelper = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretportfoliojwtkey_9876543210';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Session expired or invalid token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Authorization token is required' });
    }
};


// API ROUTES


// --- AUTHENTICATION ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = dbHelper.readDb();
    if (username === db.admin.username && bcrypt.compareSync(password, db.admin.passwordHash)) {
        const token = jwt.sign({ username: db.admin.username, isAdmin: true }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ success: true, token });
    }

    res.status(401).json({ error: 'Invalid username or password' });
});

app.get('/api/auth/status', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.json({ isAdmin: false });
            }
            return res.json({ isAdmin: true });
        });
    } else {
        res.json({ isAdmin: false });
    }
});

// --- SERVICES ---
app.get('/api/services', (req, res) => {
    const db = dbHelper.readDb();
    res.json(db.services || []);
});

app.post('/api/services', authenticateJWT, (req, res) => {
    const { title, icon, description, details } = req.body;
    if (!title || !description || !details) {
        return res.status(400).json({ error: 'Missing required service fields' });
    }

    const db = dbHelper.readDb();
    const newService = {
        id: 'serv_' + Date.now(),
        icon: icon || 'fa-solid fa-code',
        title,
        description,
        details,
        order: Date.now()
    };
    db.services.push(newService);
    dbHelper.writeDb(db);
    res.status(201).json(newService);
});

app.delete('/api/services/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const db = dbHelper.readDb();
    const initialLength = db.services.length;
    db.services = db.services.filter(s => s.id !== id);
    
    if (db.services.length === initialLength) {
        return res.status(404).json({ error: 'Service not found' });
    }

    dbHelper.writeDb(db);
    res.json({ success: true, message: 'Service deleted successfully' });
});

// --- SKILLS ---
app.get('/api/skills', (req, res) => {
    const db = dbHelper.readDb();
    res.json(db.skills || []);
});

app.post('/api/skills', authenticateJWT, (req, res) => {
    const { name, percent } = req.body;
    const percentage = parseInt(percent);
    if (!name || isNaN(percentage) || percentage < 0 || percentage > 100) {
        return res.status(400).json({ error: 'Invalid name or percentage' });
    }

    const db = dbHelper.readDb();
    const newSkill = {
        id: 'skill_' + Date.now(),
        name,
        percent: percentage,
        order: Date.now()
    };
    db.skills.push(newSkill);
    dbHelper.writeDb(db);
    res.status(201).json(newSkill);
});

app.delete('/api/skills/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const db = dbHelper.readDb();
    const initialLength = db.skills.length;
    db.skills = db.skills.filter(s => s.id !== id);
    
    if (db.skills.length === initialLength) {
        return res.status(404).json({ error: 'Skill not found' });
    }

    dbHelper.writeDb(db);
    res.json({ success: true, message: 'Skill deleted successfully' });
});

// --- PROJECTS ---
app.get('/api/projects', (req, res) => {
    const db = dbHelper.readDb();
    res.json(db.projects || []);
});

app.post('/api/projects', authenticateJWT, (req, res) => {
    const { title, image, video, github, demo, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const db = dbHelper.readDb();
    const newProject = {
        id: 'proj_' + Date.now(),
        title,
        image: image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        video: video || '',
        github: github || '',
        demo: demo || '',
        description,
        createdAt: Date.now()
    };
    db.projects.unshift(newProject);
    dbHelper.writeDb(db);
    res.status(201).json(newProject);
});

app.delete('/api/projects/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const db = dbHelper.readDb();
    const initialLength = db.projects.length;
    db.projects = db.projects.filter(p => p.id !== id);
    
    if (db.projects.length === initialLength) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }

    dbHelper.writeDb(db);
    res.json({ success: true, message: 'Project deleted successfully' });
});

// --- MESSAGES ---
app.post('/api/messages', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const db = dbHelper.readDb();
    const newMessage = {
        id: 'msg_' + Date.now(),
        name,
        email,
        subject: subject || 'No Subject',
        message,
        date: new Date().toISOString()
    };
    db.messages.unshift(newMessage);
    dbHelper.writeDb(db);
    res.status(201).json(newMessage);
});

app.get('/api/messages', authenticateJWT, (req, res) => {
    const db = dbHelper.readDb();
    res.json(db.messages || []);
});

app.delete('/api/messages/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const db = dbHelper.readDb();
    const initialLength = db.messages.length;
    db.messages = db.messages.filter(m => m.id !== id);

    if (db.messages.length === initialLength) {
        return res.status(404).json({ error: 'Message not found' });
    }

    dbHelper.writeDb(db);
    res.json({ success: true, message: 'Message deleted successfully' });
});

// --- CONTACT INFO ---
app.get('/api/contact-info', (req, res) => {
    const db = dbHelper.readDb();
    res.json(db.contactInfo || {});
});

app.put('/api/contact-info', authenticateJWT, (req, res) => {
    const { email, phone, location, availability } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const db = dbHelper.readDb();
    db.contactInfo = { email, phone, location, availability };
    dbHelper.writeDb(db);
    res.json(db.contactInfo);
});

// Serve frontend static assets from project directory
app.use(express.static(__dirname));

// Direct any unmatched GET requests to the home page (HTML router fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Portfolio server running at: http://localhost:${PORT}`);
});
