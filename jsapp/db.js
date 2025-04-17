const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/groclog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Create user schema in database
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0  // 0 = regular user, 1 = admin
    }
});
// Auto-increment userId (starts at 1, increments by 1)
userSchema.plugin(AutoIncrement, {
    id: 'user_id_counter',  // Identifier for the counter
    inc_field: 'userId',    // Field to increment
    start_seq: 1           // First userId will be 1
});
const User = mongoose.model('User', userSchema);

// Create item schema in database
const itemSchema = new mongoose.Schema({
    userId: {type: Number, required: true},
    item: {type: String, required: true},
    price: {type: Number, required: true},
    purchaseDate: { type: Date, required: true, default: Date.now },
    location: String,
    brand: String,
    type: String,
});
const Item = mongoose.model('Item', itemSchema);

module.exports = {
    User,
    Item,
}