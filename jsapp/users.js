const db = require('./db');

const users = [
    { username: 'admin', password: 'adminpass', role: 'admin' },
    { username: 'author', password: 'authorpass', role: 'author' }
];

function authenticate(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    return !!user;
}

function getUser(username) {
    return users.find(u => u.username === username);
}

function getUsers(req, res) {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

function addUser(req, res) {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can create new users' });
    }

    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(query, [username, password, role], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User added successfully', id: result.insertId });
    });
}

module.exports = {
    authenticate,
    getUser,
    getUsers,
    addUser,
};