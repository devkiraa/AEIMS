const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup');
});

// forgot-passowrd route
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// forgot-passowrd route
//router.get('/forgot-password/contact', (req, res) => {
//    res.render('forgot-password-request');
//});

// forgot-passowrd route
router.get('/forgot-password/:Token', (req, res) => {
    res.render('forgot-password-request');
});

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
        db.query(sql, [user_id, email, hashedPassword, 'regw', dept, '0'], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server Error');
            }

            // Insert into `user_details` table
            const sql2 = 'INSERT INTO user_details (usr_id, usr_aname, usr_mob, usr_club) VALUES (?, ?, ?, ?)';
            db.query(sql2, [user_id, full_name, mobile, club], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server Error');
                }
                res.redirect('/auth/signup-waiting');
            });
        });
    });
});


// Registration waiting page
router.get('/waiting', (req, res) => {
    res.render('waiting');
});

module.exports = router;
