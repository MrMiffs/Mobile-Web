const { Item } = require('./db');

console.log('Accessing itemlog.js...');

// Add new item
async function addItem(req, res) {
    const { userId, item, price, purchaseDate, location, brand, type } = req.body;
    if (!userId || !item || !price || !purchaseDate) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    const newItem = new Item({
        userId: userId,
        item,
        price,
        purchaseDate: purchaseDate,
        location: location || null,
        brand: brand || null,
        type: type || null
    });

    try {
        const savedItem = await newItem.save();
        res.json({ message: 'Item added successfully', id: savedItem._id });
    } catch (err) {
        console.error('Error inserting item:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

// Search items
async function searchItems(req, res) {
    const { userId, item, price, purchaseDate, start_date, end_date, location, brand, type } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    let filter = { userId: userId };

    if (item) filter.item = { $regex: item, $options: 'i' };
    if (price) filter.price = price;
    if (purchaseDate) {
        filter.purchaseDate = purchaseDate;
    } else if (start_date && end_date) {
        filter.purchaseDate = { $gte: start_date, $lte: end_date };
    }
    if (location) filter.location = location;
    if (brand) filter.brand = brand;
    if (type) filter.type = type;

    try {
        const items = await Item.find(filter);
        res.json(items);
    } catch (err) {
        console.error('Error searching items:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

// Delete item
async function deleteItem(req, res) {
    const { userId, item, price, purchaseDate } = req.body;
    if (!userId || !item || !price || !purchaseDate) {
        return res.status(400).json({ error: 'All fields are required for deletion' });
    }

    try {
        const result = await Item.deleteOne({
            userId: userId,
            item,
            price,
            purchaseDate: purchaseDate
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No matching item found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error('Error deleting item:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

// Edit item
async function editItem(req, res) {
    const {
        userId,
        item,
        price,
        purchaseDate,
        newItem,
        newPrice,
        newDate,
        newLocation,
        newBrand,
        newType
    } = req.body;

    if (!userId || !item || !price || !purchaseDate || !newItem || !newPrice || !newDate) {
        return res.status(400).json({ error: 'Required fields missing for editing' });
    }

    try {
        const result = await Item.updateOne(
            {
                userId,
                item,
                price,
                purchaseDate,
            },
            {
                $set: {
                    item: newItem,
                    price: newPrice,
                    purchaseDate: newDate,
                    location: newLocation || null,
                    brand: newBrand || null,
                    type: newType || null
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'No matching item found to update' });
        }
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

module.exports = {
    addItem,
    searchItems,
    deleteItem,
    editItem
};
