const db = require('./db')
const bcrypt = require('bcrypt')

async function login(req, res) {
    const { username, password } = req.body;
    const user = await db.Users.findOne({ username });

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (isValid) {
        return res.status(200).json({ message: 'Login successful' });
    } else {
        return res.status(401).json({ message: 'Invalid password' });
    }
}

async function register(req, res) {
    const { username, password } = req.body;

    if (await User.findOne({ username })) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, passwordHash });

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