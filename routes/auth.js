const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch'); // Ensure this package is installed
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

        res.redirect('/dashboard');
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
                    body: `Hi ${full_name}, welcome to AEIMS. We're excited to have you!`
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

// GET dashboard route
router.get('/dashboard', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const { user_role: userRole, user_name: userName } = req.session;
    const events = [];  // Placeholder: Fetch actual events as needed
    const inventoryItems = [];  // Placeholder: Fetch actual inventory items as needed

    res.render('dashboard', {
        userRole,
        userName,
        events,
        inventoryItems: userRole === 'admin' ? [] : inventoryItems // Hide inventory for admin on dashboard
    });
});

module.exports = router;
