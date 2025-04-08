//Functions to verify user login

const db = require('./db');
const { createHmac} = require('node:crypto');

//secret should be identical to the secret in users.js
const secret = 'desert-you'
const hash = (str) =>
    createHmac('sha256', secret).update(str).digest('hex');

console.log("Accessing login.js...");

//Processes login attempt on homepage
async function loginAttempt(req, res){
    console.log(req.body)
    const { user, pw } = req.body;
    console.log("username: ",user)
    console.log("password: ",pw)
    if (!user || !pw) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let validation = await(validateLogin(user,pw))

    console.log("validate(user,pw): ",validation)
    switch(validation) {
        case -1:
            console.log(-1)
            return res.status(401).json({code: -1});
        case 0:
            console.log(0)
            return res.status(200).json({code: 0});
        case 1:
            console.log(1)
            return res.status(200).json({code: 1});
    }

    //const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
}

//Returns permission level of user if the login is valid, -1 otherwise
async function validateLogin(user, pw) {

    console.log("Beginning of validateLogin function");

    hashedpw = hash(pw)
    console.log("hashedPassword: ",hashedpw)
    const query = 'SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1';
    try {
        const [rows] = await db.promise().query(query, [user, hashedpw]);
        console.log("[rows]: ",rows)
        if (rows.length === 0) {
            console.log("Error: No user found or incorrect password");
            return -1;
        } else {
            console.log("No error, user exists with correct password");
            console.log("Result (perm):", rows[0].perm);
            return rows[0].perm;
        }
    }
    catch (error) {
        console.error("Database error:", error);
    }
}

module.exports = {
    loginAttempt
}