const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Handle POST request for creating a quick event
router.post('/quick-event', async (req, res) => {
    const { startDate, endDate, startTime, endTime, eventTitle, venue } = req.body;

    if (!startDate || !endDate || !startTime || !endTime || !eventTitle || !venue) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const usr_id = req.session?.user_id || 1; // Assuming user_id from session or default to 1
    if (!usr_id) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
        // Retrieve the maximum evn_qk_id to determine the next ID
        const [rows] = await db.query('SELECT MAX(evn_qk_id) AS maxId FROM event_quick');
        const nextId = (rows[0].maxId || 0) + 1;

        // Prepare and execute the insert query
        const query = `
            INSERT INTO event_quick (evn_qk_id, evn_qk_name, ven_id, evn_qk_sd, evn_qk_ed, evn_qk_st, evn_qk_et, usr_id, qck_stat)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        `;
        await db.query(query, [nextId, eventTitle, venue, startDate, endDate, startTime, endTime, usr_id]);

        console.log("Event created successfully");
        res.status(201).json({ message: 'Quick event created successfully!' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Failed to create quick event.' });
    }
});

// Endpoint to retrieve quick event data by evn_qck_id
router.get('/getquick', async (req, res) => {
    const quickEventId = req.query.evn_qck_id; // Access the evn_qck_id from the query parameters

    if (!quickEventId) {
        return res.status(400).json({ error: 'evn_qck_id is required' });
    }

    try {
        // Query the database to retrieve the quick event details
        const [rows] = await db.query(
            'SELECT * FROM event_quick WHERE evn_qk_id = ?', [quickEventId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Quick event not found' });
        }

        // Send back the quick event data
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching quick event data:', error);
        res.status(500).json({ error: 'Failed to retrieve quick event data' });
    }
});

module.exports = router;
