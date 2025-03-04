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
  host: '72.14.183.106',
  user: 'dbmanager',
  password: 'manager',
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

// Delete Item Route
app.post('/api/delete', (req, res) => {
  const { user_id, item, price, purchase_date } = req.body;
  if (!user_id || !item || !price || !purchase_date) {
    return res.status(400).json({ error: 'All fields are required for deletion' });
  }

  const query = 'DELETE FROM itemlog WHERE user_id = ? AND item = ? AND price = ? AND purchase_date = ?';
  db.query(query, [user_id, item, price, formatDate(purchase_date)], (err, result) => {
    if (err) {
      console.error('Error deleting item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No matching item found' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

// Edit Item Route
app.post('/api/edit', (req, res) => {
  const { user_id, item, price, purchase_date, newItem, newPrice, newDate } = req.body;

  if (!user_id || !item || !price || !purchase_date || !newItem || !newPrice || !newDate) {
    return res.status(400).json({ error: 'All fields are required for editing' });
  }

  const query = `
    UPDATE itemlog 
    SET item = ?, price = ?, purchase_date = ? 
    WHERE user_id = ? AND item = ? AND price = ? AND purchase_date = ?
  `;

  db.query(
      query,
      [newItem, newPrice, newDate, user_id, item, price, formatDate(purchase_date)],
      (err, result) => {
        if (err) {
          console.error('Error updating item:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'No matching item found to update' });
        }
        res.json({ message: 'Item updated successfully' });
      }
  );
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

function formatDate(dateString) {
  return new Date(dateString).toISOString().split('T')[0]; //Extracts simple YYYY-MM-DD string
}