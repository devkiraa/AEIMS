const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection using promise-based mysql2

// Endpoint to fetch all events (pending, approved, and rejected)
router.get('/events', async (req, res) => {
    try {
      // Fetch all events with coordinator details
      const allEventsQuery = `
        SELECT e.evn_id, e.evn_name, e.evn_desc, e.evn_dept, e.event_poster, e.event_sd, e.evn_ed, 
               e.evn_st, e.event_et, e.evn_vol_cnt, e.evn_snk, e.evn_food, e.evn_stat, e.evn_approval, 
               u.usr_aname as organizer
          FROM event_tb e
          JOIN event_coordinator ec ON e.evn_id = ec.evn_id
          JOIN user_details u ON ec.usr_id = u.usr_id`;
       
      const [allEvents] = await db.query(allEventsQuery);
  
      res.json(allEvents);
    } catch (error) {
      console.error("Error fetching events: ", error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

// Endpoint to approve an event
router.post('/events/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const approveQuery = 'UPDATE event_tb SET evn_approval = 1 WHERE evn_id = ?';
        await db.query(approveQuery, [id]);
        res.status(200).json({ message: 'Event approved successfully' });
    } catch (error) {
        console.error("Error approving event: ", error);
        res.status(500).json({ error: 'Failed to approve event' });
    }
});

// Endpoint to reject an event
router.post('/events/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const rejectQuery = 'UPDATE event_tb SET evn_approval = 2 WHERE evn_id = ?';
        await db.query(rejectQuery, [id]);
        res.status(200).json({ message: 'Event rejected successfully' });
    } catch (error) {
        console.error("Error rejecting event: ", error);
        res.status(500).json({ error: 'Failed to reject event' });
    }
});

module.exports = router;
