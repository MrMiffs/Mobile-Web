const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const users =  require('./users');

app.use(bodyParser.json());

app.post('/api/login', users.login);
app.post('/api/register', users.register);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});