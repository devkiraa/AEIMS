const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection using promise-based mysql2

// Route to fetch all ongoing and upcoming events
router.get('/events', async (req, res) => {
    const sql = `
        SELECT 
            evn_id AS id,
            evn_name AS name,
            evn_desc AS description,
            evn_banner AS banner,
            event_poster AS image,
            evn_type AS type,
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
        AND event_sd >= NOW() -- Upcoming events
        ORDER BY event_sd ASC`;

    try {
        const [events] = await db.query(sql);
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

module.exports = router;