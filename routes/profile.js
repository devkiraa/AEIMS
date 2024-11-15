// profile.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');  // Assuming db is set up for database queries

// GET profile page
router.get('/profile', async (req, res) => {
    const userId = req.session.userId;  // Assuming user session contains userId
    try {
        const user = await db.query(
            `SELECT u.usr_name, u.usr_dept, u.usr_role, ud.usr_aname, ud.usr_mob, ud.usr_club
            FROM users u
            JOIN user_details ud ON u.usr_id = ud.usr_id
            WHERE u.usr_id = ?`, 
            [userId]
        );
        res.render('profile', { user: user[0] });
    } catch (error) {
        res.render('profile', { errorMessage: 'Error fetching profile information.' });
    }
});

// POST update profile
router.post('/profile', async (req, res) => {
    const { full_name, mobile, dept, club } = req.body;
    const userId = req.session.userId;

    try {
        // Update the user profile in the user_details table
        await db.query(
            'UPDATE user_details SET usr_aname = ?, usr_mob = ?, usr_club = ? WHERE usr_id = ?',
            [full_name, mobile, club, userId]
        );
        
        // Update the department in the users table
        await db.query(
            'UPDATE users SET usr_dept = ? WHERE usr_id = ?',
            [dept, userId]
        );
        
        res.redirect('/profile');
    } catch (error) {
        res.render('profile', { user: req.body, errorMessage: 'Error updating profile.' });
    }
});

module.exports = router;
