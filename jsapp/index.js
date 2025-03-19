#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const itemlog = require('./itemlog');
const users = require('./users');
const login = require('./login')

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

//Routes for login
app.post('/api/login', login.loginAttempt)

// Routes for itemlog
app.post('/api/additem', itemlog.addItem);
app.post('/api/searchitem', itemlog.searchItems);
app.delete('/api/deleteitem', itemlog.deleteItem);
app.put("/api/edititem", itemlog.editItem);

//Routes for users
app.post('/api/adduser', users.addUser);
app.post('/api/getusers', users.getUsers);
app.post('/api/searchusers', users.searchUsers);
app.delete('/api/deleteuser', users.deleteUser);
app.put('/api/edituser', users.editUser);
app.post('/api/getID', users.getID)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});