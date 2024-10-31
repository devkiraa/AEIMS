const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');

// POST login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query user by email
        const [users] = await db.query('SELECT * FROM users WHERE usr_name = ?', [email]);

        if (users.length === 0) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const user = users[0];

        if (user.usr_role === 'regw') {
            return res.render('login', { error: 'User registration is pending approval' });
        }

        const isMatch = await bcrypt.compare(password, user.usr_pass);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const [userDetails] = await db.query('SELECT usr_aname FROM user_details WHERE usr_id = ?', [user.usr_id]);

        req.session.user_id = user.usr_id;
        req.session.user_role = user.usr_role;
        req.session.user_name = userDetails[0].usr_aname;
        req.session.user_dept = user.usr_dept;
        req.session.user_status = user.usr_stat;

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Database query failed');
    }
});


// // Handle Login POST request
// router.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     // Query to fetch the user based on the email (usr_name)
//     const sql = 'SELECT * FROM users WHERE usr_name = ?';
//     db.query(sql, [email], async (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Server Error');
//         }

//         // Check if user exists
//         if (result.length === 0) {
//             return res.status(404).send('User not found');
//         }

//         const user = result[0];

//         // Compare the provided password with the hashed password stored in the database
//         const isMatch = await bcrypt.compare(password, user.usr_pass);
//         if (!isMatch) {
//             return res.status(400).send('Invalid Email or Password');
//         }

//         // Password matches, fetch additional user details if needed
//         const userDetailsQuery = 'SELECT * FROM user_details WHERE usr_id = ?';
//         db.query(userDetailsQuery, [user.usr_id], (err, userDetails) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).send('Server Error');
//             }

//             // Set session or handle authentication here
//             req.session.user_id = user.usr_id; // Set user session
//             req.session.user_name = userDetails[0].usr_aname; // Set user's full name in session

//             // Redirect to dashboard or another page
//             res.redirect('/dashboard');
//         });
//     });
// });

// POST signup route
router.post('/signup', async (req, res) => {
    const { full_name, mobile, email, password, club, dept } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [[{ max_id }]] = await db.query('SELECT MAX(usr_id) AS max_id FROM users');
        const user_id = (max_id || 0) + 1;

        await db.query(
            'INSERT INTO users (usr_id, usr_name, usr_pass, usr_role, usr_dept, usr_stat) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, email, hashedPassword, 'regw', dept, '0']
        );

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
            console.error("Email Error:", error);
            return res.status(500).send('Error processing sign-up');
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).send('Server Error');
    }
});

// router.post('/signup', async (req, res) => {
//     const { full_name, mobile, email, password, club, dept } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Fetch the latest user ID
//     db.query('SELECT MAX(usr_id) AS max_id FROM users', (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Server Error');
//         }
//         const user_id = result[0].max_id + 1;

//         // Insert into `users` table
//         const sql = `INSERT INTO users (usr_id, usr_name, usr_pass, usr_role, usr_dept, usr_stat) VALUES (?, ?, ?, ?, ?, ?)`;
//         db.query(sql, [user_id, email, hashedPassword, 'regw', dept, '0'], (err) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).send('Server Error');
//             }

//             // Insert into `user_details` table, including the creation date
//             const sql2 = `
//                 INSERT INTO user_details (usr_id, usr_aname, usr_mob, usr_cre_date, usr_club) 
//                 VALUES (?, ?, ?, CURDATE(), ?)`;

//             db.query(sql2, [user_id, full_name, mobile, club], (err) => {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).send('Server Error');
//                 }
//                 res.redirect('/signup-waiting');
//             });
//         });
//     });
// });

module.exports = router;
