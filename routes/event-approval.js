const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection using promise-based mysql2

// Middleware to get user's department based on the logged-in user
async function getUserDepartment(userId) {
    const userQuery = `SELECT usr_dept FROM users WHERE usr_id = ?`;
    const [userResult] = await db.query(userQuery, [userId]);
    return userResult.length ? userResult[0].usr_dept : null;
}

// Endpoint to fetch events based on user's department
router.get('/events', async (req, res) => {
    try {
        // Access user_id from the session
        const userId = req.session.user_id;
        console.log(userId); // Check if userId is correctly set

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User ID not found in session' });
        }

        // Get the logged-in user's department
        const userDept = await getUserDepartment(userId);
        if (!userDept) {
            return res.status(404).json({ error: 'User department not found' });
        }

        // Fetch events that match the user's department
        const allEventsQuery = `
            SELECT e.evn_id, e.evn_name, e.evn_desc, e.evn_dept, e.event_poster, e.event_sd, e.evn_ed, 
                   e.evn_st, e.event_et, e.evn_vol_cnt, e.evn_snk, e.evn_food, e.evn_stat, e.evn_approval, 
                   u.usr_aname as organizer
            FROM event_tb e
            JOIN event_coordinator ec ON e.evn_id = ec.evn_id
            JOIN user_details u ON ec.usr_id = u.usr_id
            WHERE e.evn_dept = ?`; // Filter by user's department

        const [allEvents] = await db.query(allEventsQuery, [userDept]);
        res.json(allEvents);
    } catch (error) {
        console.error("Error fetching events: ", error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});


module.exports = router;
