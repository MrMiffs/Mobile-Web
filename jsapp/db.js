//Creates and exports a connection to groclog database
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '72.14.183.106',
    user: 'dbmanager',
    password: 'manager',
    database: 'groclog',
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = db;