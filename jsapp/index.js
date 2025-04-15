const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const db = require('./db')
const users =  require('./users');

const app = express();
app.use(cors({
    origin: "https://testname.mooo.com",
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "https://testname.mooo.com",
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling'] // Enable both transports
    },
    allowEIO3: true // For Socket.io v2/v3 compatibility
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            // Clear invalid token
            res.clearCookie('token');
            return res.status(403).json({ message: 'Forbidden - Invalid token' });
        }
        req.user = user;
        next();
    });
}

app.post('/api/login', users.login);
app.post('/api/register', users.register);
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is protected data', user: req.user });
});
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await db.Messages.find().sort({ timestamp: 1 }).limit(50);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Message is required and must be a string' });
        }

        const newMessage = new db.Messages({
            username: req.user.username,
            message: message.trim()
        });

        await newMessage.save();

        // Emit to all connected clients if using WebSockets
        io.emit('new_message', newMessage); // If you implement WebSockets later

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Message save error:', err);
        res.status(500).json({ message: 'Error saving message', error: err.message });
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});