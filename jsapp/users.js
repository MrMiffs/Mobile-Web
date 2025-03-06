//Functions needed to access and manage users  table in MySQL database

const db = require('./db');

console.log('Accessing users.js...');

//Stores json version of SQL query results in res
function getUsers(req, res) {
    const query = 'SELECT * FROM users';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error searching items:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

// Takes info from req and returns a message in res
function addUser(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User added successfully', id: result.insertId });
    });
}

module.exports = {
    getUsers,
    addUser,
}