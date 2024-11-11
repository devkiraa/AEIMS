// myevents.js
const express = require('express');
const router = express.Router();
const { Event, EventCoordinator } = require('../models'); // Sequelize models setup assumed
const db = require('../models/db'); // Database connection setup

// Route to fetch user's events along with associated coordinators
router.get('/api/myevents', async (req, res) => {
    try {
        const userId = req.session.user_id; // Ensure session handling is correct
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Fetch events where the user is a coordinator
        const userCoordinatedEvents = await EventCoordinator.findAll({
            where: { usr_id: userId },
            attributes: ['evn_id']
        });

        const eventIds = userCoordinatedEvents.map(eventCoord => eventCoord.evn_id);

        // Fetch event details for the user's coordinated events
        const events = await Event.findAll({
            where: { evn_id: eventIds }
        });

        // For each event, fetch associated coordinators
        const eventsWithCoordinators = await Promise.all(events.map(async (event) => {
            const coordinators = await EventCoordinator.findAll({
                where: { evn_id: event.evn_id },
                attributes: ['usr_id']
            });
            return {
                ...event.toJSON(),
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
router.get('/api/event-coordinators', async (req, res) => {
    try {
        const { evn_id } = req.query;

        if (!evn_id) return res.status(400).json({ message: 'Event ID is required' });

        // Fetch coordinators for the given event ID
        const coordinators = await EventCoordinator.findAll({
            where: { evn_id },
            attributes: ['usr_id']
        });

        res.json(coordinators);
    } catch (error) {
        console.error("Error fetching coordinators:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
