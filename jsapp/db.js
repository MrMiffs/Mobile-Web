const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/thiscord', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Users schema
const usersSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true }
});
const Users = mongoose.model('Users', usersSchema);

const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});
const Messages = mongoose.model('Messages', messageSchema);


module.exports = {
    Users,
    Messages,
}