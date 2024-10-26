const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // SQL to find user by email
    const sql = 'SELECT * FROM users WHERE usr_name = ?';

    // Query the database for the user
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query failed');
        }

        // Check if user exists
        if (results.length === 0) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const user = results[0]; // Get the user object from the query result

        // Check if the user registration is still pending
        if (user.usr_role === 'regw') {
            return res.render('login', { error: 'User registration is pending approval' });
        }

        // Verify the password
        const isMatch = await bcrypt.compare(password, user.usr_pass);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        // Fetch the user's full name from user_details
        const userDetailsSql = 'SELECT usr_aname FROM user_details WHERE usr_id = ?';
        db.query(userDetailsSql, [user.usr_id], (err, userDetails) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching user details');
            }

            // Store the full name in the session
            req.session.user_id = user.usr_id;
            req.session.user_name = userDetails[0].usr_aname;

            // Redirect to dashboard
            res.redirect('/');
        });
    });
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

router.post('/signup', async (req, res) => {
    const { full_name, mobile, email, password, club, dept } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Fetch the latest user ID
    db.query('SELECT MAX(usr_id) AS max_id FROM users', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server Error');
        }
        const user_id = result[0].max_id + 1;

        // Insert into `users` table
        const sql = `INSERT INTO users (usr_id, usr_name, usr_pass, usr_role, usr_dept, usr_stat) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(sql, [user_id, email, hashedPassword, 'regw', dept, '0'], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server Error');
            }

            // Insert into `user_details` table, including the creation date
            const sql2 = `
                INSERT INTO user_details (usr_id, usr_aname, usr_mob, usr_cre_date, usr_club) 
                VALUES (?, ?, ?, CURDATE(), ?)`;

            db.query(sql2, [user_id, full_name, mobile, club], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server Error');
                }
                res.redirect('/signup-waiting');
            });
        });
    });
});

module.exports = router;
