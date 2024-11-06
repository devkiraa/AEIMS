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

module.exports = router;
