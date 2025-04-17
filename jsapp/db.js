const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/groclog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Create user schema in database
const userSchema = new mongoose.Schema({
    userId: {type: Number, unique: true, required: true},
    username: { type: String, unique: true , required: true },
    passwordHash: { type: String, required: true },
    role: {type: Number, default: 0},
});
userSchema.plugin(AutoIncrement, {inc_field: 'userId'});
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