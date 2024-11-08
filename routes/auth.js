const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db'); // Assuming this connects to your database

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE usr_name = ?', [email]);

        if (users.length === 0) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const user = users[0];

        // Ensure usr_stat is interpreted as a number
        if (parseInt(user.usr_stat) === -1) {
            return res.render('login', { error: 'You are restricted from logging in.' });
        }

        // Check if user registration is pending approval
        if (user.usr_role === 'regw') {
            return res.render('login', { error: 'User registration is pending approval' });
        }

        const isMatch = await bcrypt.compare(password, user.usr_pass);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const [userDetails] = await db.query('SELECT usr_aname FROM user_details WHERE usr_id = ?', [user.usr_id]);

        // Set session variables
        req.session.user_id = user.usr_id;
        console.log('User ID set in session:', req.session.user_id); // Log session data here=
        req.session.user_role = user.usr_role;
        req.session.user_name = userDetails[0].usr_aname;
        req.session.user_dept = user.usr_dept;
        req.session.user_status = user.usr_stat;

        // Get current date and time for logging
        const loginDate = new Date();
        const logDate = loginDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const logTime = loginDate.toTimeString().split(' ')[0]; // HH:MM:SS format

        // Insert login log into user_login_log table
        await db.query(
            'INSERT INTO user_login_log (usr_id, usr_log_dt, usr_log_time) VALUES (?, ?, ?)',
            [user.usr_id, logDate, logTime]
        );

        res.redirect('/');
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send('Database query failed');
    }
});

// POST signup route
router.post('/signup', async (req, res) => {
    const { full_name, mobile, email, password, club, dept } = req.body;

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get new user ID
        const [[{ max_id }]] = await db.query('SELECT MAX(usr_id) AS max_id FROM users');
        const user_id = (max_id || 0) + 1;

        // Insert into users table
        await db.query(
            'INSERT INTO users (usr_id, usr_name, usr_pass, usr_role, usr_dept, usr_stat) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, email, hashedPassword, 'regw', dept, '0']
        );

        // Insert into user_details table
        await db.query(
            'INSERT INTO user_details (usr_id, usr_aname, usr_mob, usr_cre_date, usr_club) VALUES (?, ?, ?, CURDATE(), ?)',
            [user_id, full_name, mobile, club]
        );

        // Send welcome email after successful insertion
        try {
            const emailResponse = await fetch(`${req.protocol}://${req.get('host')}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: "Welcome to AEIMS!",
                    recipient: email,
                    body: `<p>Hi ${full_name},</p> <p>&emsp;Welcome to AEIMS. Your account has been registered successfully. Please wait until your Administrator approves your account.</p>`,
                    isHtml: true
                })
            });

            if (emailResponse.ok) {
                return res.redirect('/signup-waiting');
            } else {
                console.error('Error sending email');
                return res.status(500).send('Error sending email');
            }
        } catch (error) {
            console.error("Email Sending Error:", error);
            return res.status(500).send('Error processing sign-up');
        }
    } catch (error) {
        console.error("Signup Database Error:", error);
        res.status(500).send('Server Error');
    }
});

// Approve event
router.post('/events/approve/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        await Event.updateOne({ _id: eventId }, { approval_status: 'Approved' });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Could not approve event.' });
    }
});

// Reject event
router.post('/events/reject/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        await Event.updateOne({ _id: eventId }, { approval_status: 'Rejected' });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Could not reject event.' });
    }
});

module.exports = router;
