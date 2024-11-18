const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Ensure the db module is correctly set up

// Route to fetch coordinators for a specific event
router.get('/edit-event/details/:eventid', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userId = req.session.user_id;
    const userRole = req.session.user_role;
    const eventId = req.params.eventid;
    const editverfication = `SELECT usr_id from event_coordinator WHERE evn_id = ?`;
    const [editVerificationQuery] = await db.query(editverfication, [eventId]);

    if (editVerificationQuery.length === 0 || editVerificationQuery[0].usr_id !== userId){
        res.status(403).render("403");
    }

    const eventdetailssql = `SELECT 
            e.*, 
            COUNT(egd.gst_id) AS guest_count
        FROM 
            event_tb e
        LEFT JOIN 
            event_guest_details egd 
        ON 
            e.evn_id = egd.evn_id
        WHERE 
            e.evn_id = ?
        GROUP BY 
            e.evn_id;`;
    try {
        const [eventdetails] = await db.query(eventdetailssql, [eventId]);
        if (!eventdetails) return res.status(400).json({ message: 'Event ID is required' });
        const eventDetailsJson = JSON.stringify(eventdetails);
        res.render('editEventDetails', {eventdetails:eventDetailsJson, userRole});
    } catch (error) {
        console.error("Error fetching coordinators:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to fetch coordinators for a specific event
router.get('/edit-event/guest-details/:eventid', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userId = req.session.user_id;
    const userRole = req.session.user_role;
    const eventId = req.params.eventid;
    const editverfication = `SELECT usr_id from event_coordinator WHERE evn_id = ?`;
    const [editVerificationQuery] = await db.query(editverfication, [eventId]);

    if (editVerificationQuery.length === 0 || editVerificationQuery[0].usr_id !== userId){
        res.status(403).render("403");
    }

    const guestdetailssql = `SELECT 
        gst_id,
        evn_id,
        gst_name,
        gst_details,
        gst_type,
        gst_food,
        gst_cnv,
        gst_acc,
        gst_fee,
        gst_other
    FROM 
        event_guest_details
    WHERE 
        evn_id = ?;`;
    try {
        const [guestdetails] = await db.query(guestdetailssql, [eventId]);
        if (!guestdetails) return res.status(400).json({ message: 'Event ID is required' });
        const guestDetailsJson = JSON.stringify(guestdetails);
        res.render('editGuestDetails', {guestdetails: guestDetailsJson, userRole, eventId});
    } catch (error) {
        console.error("Error fetching coordinators:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to fetch coordinators for a specific event
router.get('/edit-event/resource/:eventid', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userId = req.session.user_id;
    const userRole = req.session.user_role;
    const eventId = req.params.eventid;
    const editverfication = `SELECT usr_id from event_coordinator WHERE evn_id = ?`;
    const [editVerificationQuery] = await db.query(editverfication, [eventId]);

    if (editVerificationQuery.length === 0 || editVerificationQuery[0].usr_id !== userId){
        res.status(403).render("403");
    }

    const resourceSelectionssql = `SELECT er.*, i."inv_prd_name"
        FROM "event_resources" er
        INNER JOIN "inventory" i ON er."inv_id" = i."inv_id"
        WHERE er."evn_id" = ?;`;
    try {
        const [resourceSelection] = await db.query(resourceSelectionssql, [eventId]);
        if (!resourceSelection) return res.status(400).json({ message: 'Event ID is required' });
        const resourceSelectionJson = JSON.stringify(resourceSelection);
        res.render('editResourceSelection', {resourceselection: resourceSelectionJson, userRole, eventId});
    } catch (error) {
        console.error("Error fetching coordinators:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to fetch coordinators for a specific event
router.delete('/api/clear-resource/:eventid', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userId = req.session.user_id;
    const userRole = req.session.user_role;
    const eventId = req.params.eventid;
    const editverfication = `SELECT usr_id from event_coordinator WHERE evn_id = ?`;
    const [editVerificationQuery] = await db.query(editverfication, [eventId]);

    if (editVerificationQuery.length === 0 || editVerificationQuery[0].usr_id !== userId){
        res.status(403).render("403");
    }

    const clearResourcesql = `DELETE FROM event_resources WHERE evn_id = ?;`;
    try {
        const [clearresource] = await db.query(clearResourcesql, [eventId]);
        if (!clearresource) {
            return res.status(400).json({ message: 'Event ID is required' });
        } else {
            return res.status(200).json({ message: 'cleared' });
        }
    } catch (error) {
        console.error("Error fetching coordinators:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/api/modify-event/:eventid', async (req, res) => {
    const {
        editedEventDetails, // This contains eventTitle, eventDescription, eventLink, volunteerCount, guestCount, eventFood
        editedEventPosterURL,
        editedEventBannerURL,
        resources,
        editedGuestDetails // This will be present only if currentGuestcount >= 0
    } = req.body;

    const venueMappingxId = {
        'cslb1': 1, 'cslb2': 2,
        'cslb3': 3, 'cslb4': 4, 'cslb5': 5, 'cslb6': 6,
        'audt': 7, 'semh': 8, 'confh': 9, 'prah': 10,
        'lib': 11, 'dal': 12, 'cirsh': 13
    };

    const eventId = req.params.eventid;

    console.log(editedGuestDetails);

    // Get the current logged-in user's ID and department from the session
    const currentUser_Id = req.session.user_id;
    const currentUser_Dept = req.session.user_dept; // Assuming the user's department is stored in the session
    let evn_approval = 0;

    if (req.session.user_role === 'admin') {
        evn_approval = 1;
    } else if (req.session.user_role === 'em') {
        evn_approval = 0;
    }

    // const [[{ max_id }]] = await db.query('SELECT MAX(evn_id) AS max_id FROM event_tb');
    // const eventId = (max_id || 0) + 1; // Changed evnt_id to eventId for consistency

    // Get a connection from the pool
    const connection = await db.getConnection();

    // Disable SQL safe updates
    await connection.query('SET SQL_SAFE_UPDATES = 0;');

    try {
        // Start a transaction
        await connection.beginTransaction();

        // Insert event data into the event_tb table
        const eventUpdateQuery = `
            UPDATE event_tb
                SET 
                evn_name = ?,
                evn_desc = ?,
                evn_dept = ?,
                evn_banner = ?,
                event_poster = ?,
                ven_id = ?,
                event_sd = ?,
                evn_ed = ?,
                evn_st = ?,
                event_et = ?,
                evn_vol_cnt = ?,
                evn_snk = ?,
                evn_food = ?,
                evn_form_link = ?
            WHERE 
                evn_id = ?;`;
        
        const eventModifiedValues = [
            editedEventDetails.eventTitle, // Use eventTitle from eventDetails
            editedEventDetails.eventDescription, // Use eventDescription from eventDetails
            currentUser_Dept, // Set the event department to the current user's department
            editedEventBannerURL,
            editedEventPosterURL,
            venueMappingxId[editedEventDetails.venue], // Use the venue ID from eventData
            editedEventDetails.startDate, // Use startDate from eventData
            editedEventDetails.endDate, // Use endDate from eventData
            editedEventDetails.startTime, // Use startTime from eventData
            editedEventDetails.endTime, // Use endTime from eventData
            editedEventDetails.volunteerCount, // Use volunteerCount from eventDetails
            editedEventDetails.guestCount, // Assuming this is the count of guests
            editedEventDetails.eventFood, // Use eventFood from eventDetails
            editedEventDetails.eventLink,
            eventId // Use eventLink from eventDetails
        ];

        const [eventModifyResult] = await connection.query(eventUpdateQuery, eventModifiedValues);
        // console.log(eventModifyResult);

        // Disable SQL safe updates
        await connection.query('SET SQL_SAFE_UPDATES = 0;');

        // If guestDetails is provided, insert guest data
        if (editedGuestDetails && editedGuestDetails.length > 0) {
            const guestUpdateQuery = `
                UPDATE event_guest_details
                    SET 
                        gst_name = ?,
                        gst_details = ?,
                        gst_type = ?,
                        gst_food = ?,
                        gst_cnv = ?,
                        gst_acc = ?,
                        gst_fee = ?
                    WHERE 
                        evn_id = ? AND gst_id = ?;`;
            
            for (const guest of editedGuestDetails) {
                const guestModifyValues = [
                    guest.guestName, // Map to gst_name
                    guest.aboutGuest, // Map to gst_details
                    guest.guestType === 'external' ? 1 : 0, // Assuming 1 for external and 0 for internal
                    guest.guestFood === 'yes' ? 1 : 0, // Assuming 1 for yes and 0 for no
                    guest.guestConveyance === 'yes' ? 1 : 0, // Assuming 1 for yes and 0 for no
                    guest.guestAccommodation === 'yes' ? 1 : 0, // Assuming 1 for yes and 0 for no
                    guest.guestFees === 'yes' ? 1 : 0, // Assuming 1 for yes and 0 for no
                    eventId,
                    guest.guestId
                ];
                await connection.query(guestUpdateQuery, guestModifyValues);
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
                editedEventDetails.startDate, // Use startDate for res_tdate
                editedEventDetails.endDate, // Use endDate for res_rdate
                editedEventDetails.startTime, // Use startTime for res_ttime
                editedEventDetails.endTime  // Use endTime for res_rtime
            ];
            await connection.query(resourceInsertQuery, resourceValues);
        }

        const query = `
            INSERT INTO event_modification_log (evn_id, evn_mod_date, evn_mod_time, usr_id)
            VALUES (?, ?, ?, ?);
        `;

        const values = [
            eventId,             // evn_id
            new Date().toISOString().split('T')[0],  // evn_mod_date, format YYYY-MM-DD
            new Date().toTimeString().split(' ')[0], // evn_mod_time, format HH:MM:SS
            req.session.user_id              // usr_id
        ];

        await connection.query(query, values);

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