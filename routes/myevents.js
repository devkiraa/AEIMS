const express = require('express');
const router = express.Router();
const { Event } = require('../models'); // Assumes Sequelize or similar ORM

// GET route for fetching user's events
router.get('/api/myevents', async (req, res) => {
    try {
        const userId = req.user.id; // Adjust based on auth setup
        const events = await Event.findAll({ where: { userId } });
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
