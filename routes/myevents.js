const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Ensure the db module is correctly set up

// Route to fetch user's events with associated coordinators
router.get('/myevents', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    try {
        const userId = req.session.user_id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // SQL to fetch events with coordinators included, excluding evn_stat = 0
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
                ec.usr_id = ? AND e.evn_stat != 0
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

// Route to mark an event as inactive
router.delete('/delete-event/:id', async (req, res) => {
    const eventId = req.params.id;
    try {
        // Ensure the event exists before updating
        const checkQuery = 'SELECT evn_stat FROM event_tb WHERE evn_id = ?';
        const [event] = await db.query(checkQuery, [eventId]);
        if (event.length === 0 || event[0].evn_stat === 0) {
            return res.status(404).send({ message: 'Event not found or already inactive.' });
        }

        // Update the event's status to inactive
        const query = 'UPDATE event_tb SET evn_stat = 0 WHERE evn_id = ?';
        await db.query(query, [eventId]);
        res.status(200).send({ message: 'Event status updated to inactive.' });
    } catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).send({ message: 'Failed to update event status.' });
    }
});

// Route to fetch coordinators for a specific event
router.get('/event-coordinators', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
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
