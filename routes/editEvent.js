const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Ensure the db module is correctly set up

// Route to fetch coordinators for a specific event
router.get('/edit-event/details/:eventid', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    const userRole = req.session.user_role;
    const eventId = req.params.eventid;
    const eventdetailssql = `SELECT * FROM event_tb WHERE evn_id = ?`;
    try {
        const [eventdetails] = await db.query(eventdetailssql, [eventId]);
        if (!eventdetails) return res.status(400).json({ message: 'Event ID is required' });
        console.log(eventdetails);
        const eventDetailsJson = JSON.stringify(eventdetails);
        res.render('editEventDetails', {eventdetails:eventDetailsJson, userRole});
    } catch (error) {
        console.error("Error fetching coordinators:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;