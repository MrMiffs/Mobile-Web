#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const basicAuth = require('basic-auth');
const itemlog = require('./itemlog');
const users = require('./users');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Middleware for Basic Authentication
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || !users.authenticate(user.name, user.pass)) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.status(401).send('Unauthorized');
  }
  req.user = users.getUser(user.name);
  next();
};

// Middleware for Admin Authorization
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  next();
};

// Routes for itemlog
app.post('/api/additem', auth, itemlog.addItem);
app.get('/api/searchitem', auth, itemlog.searchItems); // Unauthenticated GET
app.put('/api/edititem', auth, itemlog.editItem);
app.delete('/api/deleteitem', auth, itemlog.deleteItem);

// Routes for users
app.post('/api/adduser', auth, adminOnly, users.addUser);
app.get('/api/getusers', auth, adminOnly, users.getUsers);

app.listen(port, () => {
  console.log(`Server running on https://localhost:${port}`);
});