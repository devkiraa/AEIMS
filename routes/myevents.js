const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Ensure the db module is correctly set up

// Route to fetch user's events with associated coordinators
router.get('/myevents', async (req, res) => {
    try {
        const userId = req.session.user_id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // SQL to fetch events with coordinators included
        const sqlEvents = `
    SELECT 
        e.evn_id, 
        e.evn_name, 
        e.event_sd, 
        e.evn_ed,
        e.evn_st,
        e.event_et,
        e.evn_approval, -- Fetch approval status
        GROUP_CONCAT(ec.usr_id) AS coordinators
    FROM 
        event_tb AS e
    INNER JOIN 
        event_coordinator AS ec 
    ON 
        e.evn_id = ec.evn_id
    WHERE 
        ec.usr_id = ?
    GROUP BY e.evn_id
    ORDER BY e.event_sd ASC;
`;
        const [events] = await db.query(sqlEvents, [userId]);

        res.json(events.map(event => ({
            ...event,
            coordinators: event.coordinators ? event.coordinators.split(',') : []
        })));
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to fetch coordinators for a specific event
router.get('/event-coordinators', async (req, res) => {
    try {
        const { evn_id } = req.query;
        if (!evn_id) return res.status(400).json({ message: 'Event ID is required' });

        const sqlCoordinators = `SELECT usr_id FROM event_coordinator WHERE evn_id = ?;`;
        const [coordinators] = await db.query(sqlCoordinators, [evn_id]);

        res.json(coordinators);
    } catch (error) {
        console.error("Error fetching coordinators:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;