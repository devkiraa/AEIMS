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
            return res.render('login', { error: 'Your account is deleted.' });
        }

        // Ensure usr_stat is interpreted as a number
        if (parseInt(user.usr_stat) === 0) {
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
        // Log session data with user name and login time
        console.log(
            `User logged in the session: ${req.session.user_id}, Name: ${req.session.user_name}, Logged in at: ${logDate} ${logTime}`
        );
        
        // Insert login log into user_login_log table
        await db.query(
            'INSERT INTO user_login_log (usr_id, usr_log_dt, usr_log_time) VALUES (?, ?, ?)',
            [user.usr_id, logDate, logTime]
        );

        res.redirect('/');
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).render('error', { status: 500, title: 'Login Error', message: 'There was an issue with logging in. Please try again later.' });
    }
});

// POST signup route
router.post('/signup', async (req, res) => {
    const { full_name, mobile, email, password, club, dept } = req.body;

    try {
         // Check if the user already exists
const [existingUser] = await db.query('SELECT * FROM users WHERE usr_name = ?', [email]);

if (existingUser.length > 0) {
    // Render the signup page with an error message if the email is already registered
    return res.render('signup', { errorMessage: 'Email is already registered. Please use a different email.' });
} else {
    // Render the signup page with errorMessage set to null
    res.render('signup', { errorMessage: null });
}

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
            const emailResponse = await fetch("https://incredible-fanchette-startupsprint-16da87c3.koyeb.app/send-email", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "subject": "Welcome to AEIMS!",
                    "recipient": email,
                    "body": `
                        <html>
                            <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; color: #333;">
                                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                    <h2 style="color: #1d4ed8; text-align: center;">Welcome to AEIMS, ${full_name}!</h2>
                                    <p style="font-size: 1rem; color: #555; text-align: center;">
                                        We are excited to have you on board. Your account has been registered successfully!
                                    </p>
                                    <p style="font-size: 1rem; color: #555; text-align: center;">
                                        Please wait until your Administrator approves your account to gain full access.
                                    </p>
                                    <p style="font-size: 1rem; color: #555; text-align: center;">
                                        Best Regards,<br>
                                        AEIMS Team
                                    </p>
                                </div>
                            </body>
                        </html>
                    `,
                    "is_html": true
                })            
            });

            if (emailResponse.ok) {
                // Log email sending in the mail_log table
                const now = new Date();
                const mail_date = now.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                const mail_time = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS
                
                // Insert log into mail_log table
                await db.query(
                    'INSERT INTO mail_log (mail_kind, mail_date, mail_time, mail_stat, usr_id, receiver_email) VALUES (?, ?, ?, ?, ?, ?)',
                    ['Welcome mail', mail_date, mail_time, 'Sent', user_id, email]
                );

                return res.redirect('/signup-waiting');
            } else {
                console.error('Error sending email');
                return res.status(500).render('error', { status: 500, title: 'Email Error', message: 'Failed to send the welcome email. Please try again later.' });
            }
        } catch (error) {
            console.error("Email Sending Error:", error);
            return res.status(500).render('error', { status: 500, title: 'Email Error', message: 'There was an error while sending the welcome email. Please try again later.' });
        }
    } catch (error) {
        console.error("Signup Database Error:", error);
        res.status(500).render('error', { status: 500, title: 'Signup Error', message: 'There was an issue with your signup. Please try again later.' });
    }
});

module.exports = router;
