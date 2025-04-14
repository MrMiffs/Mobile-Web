const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/thiscord', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Users schema
const usersSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    passwordHash: String
});
const Users = mongoose.model('Users', usersSchema);

module.exports = {
    Users,
}