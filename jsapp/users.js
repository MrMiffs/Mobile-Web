//Functions needed to access and manage users  table in MySQL database

const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = 'desert-you'

console.log('Accessing users.js...');

//Stores json version of SQL query results in res
function getUsers(req, res) {
    const query = 'SELECT * FROM users';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error searching users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}



async function login(req, res) {
    const { username, password } = req.body;

    // Check for user with matching username
    const user = await db.Users.findOne({ username });
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Check if saved hashed password matched hash of incoming password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (isValid) {
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || SECRET, // Fallback for development
            { expiresIn: '1h' }
        );

        // Save the token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Secure in production
            maxAge: 3600000 // 1 hour in milliseconds
        });

        // Return json with user info (password is not saved)
        return res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, username: user.username, role: user.role }
        });
    } else {
        return res.status(401).json({ message: 'Invalid password' });
    }
}

async function addUser(req, res) {
    const { username, password, perm } = req.body;

    if (await db.Users.findOne({ username })) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new db.Users({ username, passwordHash, perm });

    try {
        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
}

// Takes info from req and returns a json of SLQ query results
function searchUsers(req, res) {
    const { username, password, perm } = req.body;
    let query = 'SELECT * FROM users WHERE true'; //Always true, allows optional filters to be applied
    let params = [];

    if (username) {
        query += ' AND username LIKE ?';
        params.push(`%${username}%`);
    }
    if (password) {
        query += ' AND password = ?';
        params.push(password);
    }
    if (perm) {
        query += ' AND perm = ?';
        params.push(perm);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error searching users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

function deleteUser(req, res) {
    const {user_id} = req.body;
    console.log(`User_id to delete: ${user_id}`);


    if (!user_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'DELETE FROM users WHERE user_id=?';
    db.query(query, [user_id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully'});
    });
}

function editUser(req, res) {
    const {user_id, username, password, perm } = req.body;
    if (!user_id || !username || !password || !perm) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    hashedPassword = hash(password);
    const query = 'UPDATE users SET username=?, password=?, perm=? WHERE user_id=?';
    db.query( query, [username, hashedPassword, perm, user_id], (err, result) => {
            if (err) {
                console.error('Error updating user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'No matching user found to update' });
            }
            res.json({ message: 'User updated successfully' });
        }
    );
}

async function getID(req, res){
    const { user, pw } = req.body;
    if (!user || !pw) {
        return res.status(400).json({code: -1});
    }
    hashedpw = hash(pw)
    console.log("hashedPassword: ",hashedpw)

    const query = 'SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1';
    try {
        const [rows] = await db.promise().query(query, [user, hashedpw]);
        if (rows.length === 0) {
            console.log("Error: No user found or incorrect password");
            return res.status(400).json({ id: -1 });
        } else {
            console.log("No error, user exists with correct password");
            console.log("Result (perm):", rows[0].perm);
            console.log("User id to return: ",rows[0].user_id)
            if( rows[0].perm === 1) {
                return res.status(400).json({ id: 0 });
            }
            else{
                return res.status(200).json({id: rows[0].user_id})
            }
        }
    }
    catch (error) {
        console.error("Database error:", error);
        return -1;
    }

}

module.exports = {
    getUsers,
    addUser,
    searchUsers,
    deleteUser,
    editUser,
    getID,
}