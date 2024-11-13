const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection using promise-based mysql2

// Route to fetch all approved events (both upcoming and past)
router.get('/events', async (req, res) => {
    const sql = `
        SELECT 
            evn_id AS id,
            evn_name AS name,
            evn_desc AS description,
            evn_banner AS banner,
            event_poster AS image,
            ven_id AS venueId,
            event_sd AS startDate,
            evn_ed AS endDate,
            evn_st AS startTime,
            event_et AS endTime,
            evn_vol_cnt AS volunteerCount,
            evn_snk AS snacksProvided,
            evn_food AS foodProvided,
            evn_stat AS status,
            evn_approval AS approvalStatus,
            evn_form_link AS formLink
        FROM event_tb
        WHERE evn_approval = 1  -- Only approved events
        ORDER BY event_sd ASC;
    `;

    try {
        const [events] = await db.query(sql);
        res.json(events);  // Send all events to the frontend
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

module.exports = router;