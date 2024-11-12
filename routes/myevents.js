const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection setup

// Route to fetch user's events with associated coordinators
router.get('/myevents', async (req, res) => {
    try {
        const userId = req.session.user_id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // SQL to fetch events where the user is a coordinator
        const sqlEvents = `
            SELECT 
                e.evn_id, 
                e.evn_name, 
                e.event_sd, 
                e.evn_desc,
                e.evn_dept,
                e.evn_banner,
                e.event_poster,
                e.ven_id,
                e.evn_ed,
                e.evn_st,
                e.event_et,
                e.evn_vol_cnt,
                e.evn_snk,
                e.evn_food,
                e.evn_stat,
                e.evn_approval,
                e.evn_form_link
            FROM 
                event_tb AS e
            INNER JOIN 
                event_coordinator AS ec 
            ON 
                e.evn_id = ec.evn_id
            WHERE 
                ec.usr_id = ?
            ORDER BY 
                e.event_sd ASC;
        `;
        const [events] = await db.query(sqlEvents, [userId]);

        // Fetch coordinators for each event
        const eventsWithCoordinators = await Promise.all(events.map(async (event) => {
            const sqlCoordinators = `
                SELECT usr_id FROM event_coordinator WHERE evn_id = ?;
            `;
            const [coordinators] = await db.query(sqlCoordinators, [event.evn_id]);
            return {
                ...event,
                coordinators: coordinators.map(coord => coord.usr_id)
            };
        }));

        res.json(eventsWithCoordinators);
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
