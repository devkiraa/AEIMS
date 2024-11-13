const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Assuming db is a pool of connections

router.post('/create-event', async (req, res) => {
    const {
        eventData, // This contains startDate, endDate, startTime, endTime, and venue
        eventDetails, // This contains eventTitle, eventDescription, eventLink, volunteerCount, guestCount, eventFood
        eventPosterURL,
        eventBannerURL,
        resources,
        guestDetails // This will be present only if currentGuestcount >= 0
    } = req.body;

    // Get the current logged-in user's ID and department from the session
    const currentUser_Id = req.session.user_id;
    const currentUser_Dept = req.session.user_dept; // Assuming the user's department is stored in the session

    const [[{ max_id }]] = await db.query('SELECT MAX(evn_id) AS max_id FROM event_tb');
    const eventId = (max_id || 0) + 1; // Changed evnt_id to eventId for consistency

    // Get a connection from the pool
    const connection = await db.getConnection();

    try {
        // Start a transaction
        await connection.beginTransaction();

        console.log(eventId);
        console.log(currentUser_Id);
        console.log(currentUser_Dept);

        // Insert event data into the event_tb table
        const eventInsertQuery = `
            INSERT INTO event_tb (evn_id, evn_name, evn_desc, evn_dept, evn_banner, event_poster, ven_id, event_sd, evn_ed, evn_st, event_et, evn_vol_cnt, evn_snk, evn_food, evn_approval, evn_form_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const eventValues = [
            eventId,
            eventDetails.eventTitle, // Use eventTitle from eventDetails
            eventDetails.eventDescription, // Use eventDescription from eventDetails
            currentUser_Dept, // Set the event department to the current user's department
            eventBannerURL,
            eventPosterURL,
            eventData.venue, // Use the venue ID from eventData
            eventData.startDate, // Use startDate from eventData
            eventData.endDate, // Use endDate from eventData
            eventData.startTime, // Use startTime from eventData
            eventData.endTime, // Use endTime from eventData
            eventDetails.volunteerCount, // Use volunteerCount from eventDetails
            eventDetails.guestCount, // Assuming this is the count of guests
            eventDetails.eventFood, // Use eventFood from eventDetails
            0, // Assuming a default approval status
            eventDetails.eventLink // Use eventLink from eventDetails
        ];

        const [eventResult] = await connection.query(eventInsertQuery, eventValues);
        console.log(eventResult);

        // If guestDetails is provided, insert guest data
        if (guestDetails && guestDetails.length > 0) {
            const guestInsertQuery = `
                INSERT INTO event_guest_details (evn_id, gst_name, gst_details, gst_type, gst_food, gst_cnv, gst_acc, gst_fee)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
            for (const guest of guestDetails) {
                const guestValues = [
                    eventId,
                    guest.guestName, // Map to gst_name
                    guest.aboutGuest, // Map to gst_details
                    guest.guestType === 'external' ? 1 : 0, // Assuming 1 for external and 0 for internal
                    guest.guestFood === 'yes' ? 1 : 0, // Assuming 1 for yes and 0 for no
                    guest.guestConveyance === 'yes' ? 1 : 0, // Assuming 1 for yes and 0 for no
                    guest.guestAccommodation === 'yes' ? 1 : 0, // Assuming 1 for yes and 0 for no
                    guest.guestFees === 'yes' ? 1 : 0 // Assuming 1 for yes and 0 for no
                ];
                await connection.query(guestInsertQuery, guestValues);
            }
        }

        // Insert resources into the event_resources table
        const resourceInsertQuery = `
            INSERT INTO event_resources (evn_id, inv_id, res_count, res_tdate, res_rdate, res_ttime, res_rtime)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        for (const resource of resources) {
            const resourceValues = [
                eventId, // Use createdEventId instead of evntId
                resource.inv_id,
                resource.count,
                eventData.startDate, // Use startDate for res_tdate
                eventData.endDate, // Use endDate for res_rdate
                eventData.startTime, // Use startTime for res_ttime
                eventData.endTime  // Use endTime for res_rtime
            ];
            await connection.query(resourceInsertQuery, resourceValues);
        }

        // Insert the current user as the event coordinator
        const coordinatorInsertQuery = `
            INSERT INTO event_coordinator (usr_id, evn_id)
            VALUES (?, ?)`;
        
        const coordinatorValues = [currentUser_Id, eventId]; // Use the current user's ID
        await connection.query(coordinatorInsertQuery, coordinatorValues);

        // Commit the transaction
        await connection.commit();
        res.status(201).json({ message: 'Event created successfully', eventId: eventId });
    } catch (error) {
        // Rollback the transaction in case of error
        await connection.rollback();
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    } finally {
        // Release the connection back to the pool
        connection.release();
    }
});

module.exports = router;