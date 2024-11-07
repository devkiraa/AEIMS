const express = require('express');
const router = express.Router();
const db = require('../models/db'); 

// Add inventory item
router.post('/inventory/add', async (req, res) => {
    // Code here
    const { inv_prd_name, inv_item_count } = req.body;
    const inv_first_added = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format

    try {
        await db.query(
            'INSERT INTO inventory (inv_prd_name, inv_item_count, inv_first_added) VALUES (?, ?, ?)',
            [inv_prd_name, inv_item_count, inv_first_added]
        );
        res.json({ message: 'Inventory item added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add inventory item.' });
    }
});

// Add item to service
router.post('/service/add', async (req, res) => {
    // Code here
    const { inv_prd_name, service_count } = req.body;
    const service_date = new Date().toISOString().split('T')[0];

    try {
        // Decrement the inventory count
        const [[inventory]] = await db.query('SELECT * FROM inventory WHERE inv_prd_name = ?', [inv_prd_name]);
        if (!inventory || inventory.inv_item_count < service_count) {
            return res.status(400).json({ message: 'Not enough items in inventory to add to service.' });
        }

        await db.query('UPDATE inventory SET inv_item_count = inv_item_count - ? WHERE inv_prd_name = ?', [service_count, inv_prd_name]);

        // Add entry to service table
        await db.query(
            'INSERT INTO service (item_name, service_date, service_count) VALUES (?, ?, ?)',
            [inv_prd_name, service_date, service_count]
        );

        res.json({ message: 'Item added to service successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to service.' });
    }
});

router.get('/inventory', async (req, res) => {
    try {
        const inventoryItems = await db.query('SELECT * FROM inventory'); 
        console.log(inventoryItems.rows); // Log the rows for debugging
        res.json(inventoryItems.rows); 
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;