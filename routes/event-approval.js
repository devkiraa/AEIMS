const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection using promise-based mysql2

// Endpoint to fetch events based on user's department
router.get('/events', async (req, res) => {
    try {
        // Fetch events that match the user's department
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

// Function to send email
async function sendEmail(subject, recipient, body) {
    try {
        const emailResponse = await fetch(`https://incredible-fanchette-startupsprint-16da87c3.koyeb.app/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: subject,
                recipient: recipient,
                body: body,
                is_html: true
            })
        });
        return emailResponse.ok;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
}

// Endpoint to approve an event
router.post('/events/:id/approve', async (req, res) => {
    const eventId = req.params.id;

    try {
        // Approve the event in the database
        const approveQuery = `UPDATE event_tb SET evn_approval = 1 WHERE evn_id = ?`;
        await db.query(approveQuery, [eventId]);

        // Fetch the event and organizer details, including email from 'users'
        const [eventData] = await db.query(`
            SELECT e.evn_name, u.usr_name AS organizerEmail, u.usr_id
            FROM event_tb e
            JOIN event_coordinator ec ON e.evn_id = ec.evn_id
            JOIN users u ON ec.usr_id = u.usr_id
            WHERE e.evn_id = ?`, [eventId]);

        const { evn_name, organizerEmail, usr_id } = eventData[0];
        const emailSubject = "Event Approval Notification";
        const emailBody = `
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #1d4ed8; text-align: center;">Your Event "${evn_name}" Has Been Approved</h2>
                        <p style="font-size: 1rem; color: #555; text-align: center;">
                            Congratulations! Your event has been approved and is now live on the AEIMS platform.
                        </p>
                        <p style="font-size: 1rem; color: #555; text-align: center;">
                            Best Regards,<br>
                            AEIMS Team
                        </p>
                    </div>
                </body>
            </html>
        `;

        // Send approval email
        const emailSent = await sendEmail(emailSubject, organizerEmail, emailBody);

        // Log the email status in mail_log table
        const status = emailSent ? 'Sent' : 'Failed';
        const now = new Date();
        const mail_date = now.toISOString().split('T')[0];
        const mail_time = now.toTimeString().split(' ')[0];

        await db.query(
            `INSERT INTO mail_log (mail_kind, mail_date, mail_time, mail_stat, usr_id, receiver_email)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ["event approval", mail_date, mail_time, status, usr_id, organizerEmail]
        );

        res.json({ success: true, emailSent });
    } catch (error) {
        console.error("Error approving event: ", error);
        res.status(500).json({ error: 'Failed to approve event' });
    }
});

// Endpoint to reject an event
router.post('/events/:id/reject', async (req, res) => {
    const eventId = req.params.id;

    try {
        // Reject the event in the database
        const rejectQuery = `UPDATE event_tb SET evn_approval = 0 WHERE evn_id = ?`;
        await db.query(rejectQuery, [eventId]);

        // Fetch the event and organizer details, including email from 'users'
        const [eventData] = await db.query(`
            SELECT e.evn_name, u.usr_name AS organizerEmail, u.usr_id
            FROM event_tb e
            JOIN event_coordinator ec ON e.evn_id = ec.evn_id
            JOIN users u ON ec.usr_id = u.usr_id
            WHERE e.evn_id = ?`, [eventId]);

        const { evn_name, organizerEmail, usr_id } = eventData[0];
        const emailSubject = "Event Rejection Notification";
        const emailBody = `
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #ef4444; text-align: center;">Your Event "${evn_name}" Has Been Rejected</h2>
                        <p style="font-size: 1rem; color: #555; text-align: center;">
                            Unfortunately, your event did not meet the necessary requirements and has been rejected. Please contact the AEIMS team for further details.
                        </p>
                        <p style="font-size: 1rem; color: #555; text-align: center;">
                            Best Regards,<br>
                            AEIMS Team
                        </p>
                    </div>
                </body>
            </html>
        `;

        // Send rejection email
        const emailSent = await sendEmail(emailSubject, organizerEmail, emailBody);

        // Log the email status in mail_log table
        const status = emailSent ? 'Sent' : 'Failed';
        const now = new Date();
        const mail_date = now.toISOString().split('T')[0];
        const mail_time = now.toTimeString().split(' ')[0];

        await db.query(
            `INSERT INTO mail_log (mail_kind, mail_date, mail_time, mail_stat, usr_id, receiver_email)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ["event rejection", mail_date, mail_time, status, usr_id, organizerEmail]
        );

        res.json({ success: true, emailSent });
    } catch (error) {
        console.error("Error rejecting event: ", error);
        res.status(500).json({ error: 'Failed to reject event' });
    }
});

module.exports = router;