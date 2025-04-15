const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(req, res) {
    const { username, password } = req.body;
    const user = await db.Users.findOne({ username });

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (isValid) {
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key', // Fallback for development
            { expiresIn: '1h' }
        );

        // Set the token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Secure in production
            maxAge: 3600000 // 1 hour in milliseconds
        });

        return res.status(200).json({
            message: 'Login successful',
            user: { username: user.username }
        });
    } else {
        return res.status(401).json({ message: 'Invalid password' });
    }
}

async function register(req, res) {
    const { username, password } = req.body;

    if (await db.Users.findOne({ username })) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new db.Users({ username, passwordHash });

    try {
        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
}


module.exports = {
    login,
    register,
}