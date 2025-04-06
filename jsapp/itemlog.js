//Functions needed to access and manage itemlog table MySQL database

const db = require('./db');

console.log("Accessing itemlog.js...");

// Takes info from req and returns a message in res
function addItem(req, res) {
    const { user_id, item, price, purchase_date, location, brand, type } = req.body;
    if (!user_id || !item || !price || !purchase_date) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    const query = 'INSERT INTO itemlog (user_id, item, price, purchase_date, location, brand, type) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [user_id, item, price, purchase_date, location || null, brand || null, type || null], (err, result) => {
        if (err) {
            console.error('Error inserting item:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Item added successfully', id: result.insertId });
    });
}

// Takes info from req and returns a json of SLQ query results
function searchItems(req, res) {
    const { user_id, item, price, purchase_date, start_date, end_date, location, brand, type } = req.body;
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
    } else if (start_date && end_date) {
        query += ' AND purchase_date BETWEEN ? AND ?';
        params.push(start_date, end_date);
    }
    if (location) {
        query += ' AND location = ?';
        params.push(location);
    }
    if (brand) {
        query += ' AND brand = ?';
        params.push(brand);
    }
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error searching items:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

//Takes info from req and returns a message in res
function deleteItem(req, res) {
    const { user_id, item, price, purchase_date } = req.body;
    if (!user_id || !item || !price || !purchase_date) {
        return res.status(400).json({ error: 'All fields are required for deletion' });
    }

    const query = 'DELETE FROM itemlog WHERE user_id = ? AND item = ? AND price = ? AND purchase_date = ?';
    db.query(query, [user_id, item, price, purchase_date], (err, result) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No matching item found' });
        }
        res.json({ message: 'Item deleted successfully' });
    });
}

//Takes info from req for search and update values, and returns message in res
function editItem(req, res) {
    const {
        user_id,
        item,
        price,
        purchase_date,
        newItem,
        newPrice,
        newDate,
        newLocation,
        newBrand,
        newType
    } = req.body;

    if (!user_id || !item || !price || !purchase_date || !newItem || !newPrice || !newDate) {
        return res.status(400).json({ error: 'Required fields missing for editing' });
    }

    const query = `
        UPDATE itemlog
        SET item = ?,
            price = ?,
            purchase_date = ?,
            location = ?,
            brand = ?,
            type = ?
        WHERE user_id = ?
          AND item = ?
          AND price = ?
          AND purchase_date = ?
    `;

    db.query(
        query,
        [
            newItem,
            newPrice,
            newDate,
            newLocation,
            newBrand,
            newType,
            user_id,
            item,
            price,
            purchase_date
        ],
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
}

module.exports = {
    addItem,
    searchItems,
    deleteItem,
    editItem,
};