const express = require('express');
const router = express.Router();
const db = require('../models/db'); 

router.get('/inventory', async (req, res) => {
    try {
        const [inventoryItems] = await db.query('SELECT * FROM inventory'); 
        res.json(inventoryItems); 
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add inventory item
router.post('/inventory/add', async (req, res) => {
    // Code here
    const { inv_prd_name, inv_item_count, inv_stat, inv_type } = req.body;
    const inv_add_date = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format

    try {
        await db.query(
            'INSERT INTO inventory (inv_prd_name, inv_item_cnt, inv_add_date, inv_stat, inv_type) VALUES (?, ?, ?, ?, ?)',
            [inv_prd_name, inv_item_count, inv_add_date, inv_stat, inv_type]
        );
        res.json({ message: 'Inventory item added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add inventory item.' });
    }
});

// Add item to service
router.put('/inventory/service', async (req, res) => {
    // Code here
    const { inv_id, inv_serv_count, inv_serv_date, inv_stat } = req.body;

    try {
        await db.query('UPDATE inventory SET inv_serv_cnt = ?, inv_serv_date = ?, inv_stat = ? WHERE inv_id = ?', [inv_serv_count, inv_serv_date, inv_stat, inv_id]);
        res.json({ message: 'Item added to service successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to service.' });
    }
});

// Remove Item
router.put('/inventory/remove', async (req, res) => {
    // Code here
    const { inv_id, inv_rmv_count, inv_rmv_date, inv_stat } = req.body;

    try {
        await db.query('UPDATE inventory SET inv_rmv_cnt = ?, inv_rmv_date = ?, inv_stat = ? WHERE inv_id = ?', [inv_rmv_count, inv_rmv_date, inv_stat, inv_id]);
        res.json({ message: 'Item added to service successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to service.' });
    }
});

// Edit Item
router.put('/inventory/edit', async (req, res) => {
    // Code here
    const { inv_id, inv_item_count, inv_stat } = req.body;

    try {
        await db.query('UPDATE inventory SET inv_item_cnt = ?, inv_stat = ? WHERE inv_id = ?', [inv_item_count, inv_stat, inv_id]);
        res.json({ message: 'Item added to service successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to service.' });
    }
});

// Edit Item
router.put('/inventory/restore', async (req, res) => {
    // Code here
    const { inv_id, inv_serv_count, inv_serv_date, inv_stat } = req.body;
    console.log("restore");

    try {
        await db.query('UPDATE inventory SET inv_serv_cnt = ?, inv_serv_date = ?, inv_stat = ? WHERE inv_id = ?', [inv_serv_count, inv_serv_date, inv_stat, inv_id]);
        res.json({ message: 'Item added to service successfully!' });
        console.log(inv_serv_count, inv_serv_date, inv_stat, inv_id);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to service.' });
    }
});

module.exports = router;