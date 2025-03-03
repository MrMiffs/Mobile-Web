#!/usr/bin/env node

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'groclog'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Add Item Route
app.post('/api/add', (req, res) => {
  const { user_id, item, price, purchase_date } = req.body;
  if (!user_id || !item || !price || !purchase_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO itemlog (user_id, item, price, purchase_date) VALUES (?, ?, ?, ?)';
  db.query(query, [user_id, item, price, purchase_date], (err, result) => {
    if (err) {
      console.error('Error inserting item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Item added successfully', id: result.insertId });
  });
});

// Search Item Route
app.post('/api/search', (req, res) => {
  const { user_id, item, price, purchase_date } = req.body;
  let query = 'SELECT * FROM itemlog WHERE user_id = ?';
  let params = [user_id];

  if (item) {
    query += ' AND item LIKE ?';
    params.push(`%${item}%`);
  }
  if (price) {
    query += ' AND price = ?';
    params.push(price);
  }
  if (purchase_date) {
    query += ' AND purchase_date = ?';
    params.push(purchase_date);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error searching items:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
