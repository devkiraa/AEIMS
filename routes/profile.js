// profile.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');  // Assuming db is set up for database queries

// GET profile page
router.get('/profile', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userRole = req.session.user_role;
    const userId = req.session.user_id;  // Assuming user session contains userId
    const message = req.session.message || null; // Get the message from the session
    const errorMessage = req.session.errorMessage || null; // Get the error message from the session
    // Clear session messages after rendering
    req.session.message = null;
    req.session.errorMessage = null;
    try {
        const [user] = await db.query(
            `SELECT u.usr_name, u.usr_dept, ud.usr_aname, ud.usr_mob, ud.usr_club, ud.usr_cre_date
            FROM users u
            JOIN user_details ud ON u.usr_id = ud.usr_id
            WHERE u.usr_id = ?`, 
            [userId]
        );
        const userProfileJson = JSON.stringify(user);
        // Render the profile view, passing userRole, message, and errorMessage
        res.render('profile', { userRole, message, errorMessage, user: userProfileJson });
    } catch (error) {
        res.render('profile', { errorMessage: 'Error fetching profile information.' });
    }
});

// POST update profile
router.post('/profile', async (req, res) => {
    const { full_name, mobile, club } = req.body;
    const userId = req.session.user_id;

    try {
        // Update the user profile in the user_details table
        await db.query(
            'UPDATE user_details SET usr_aname = ?, usr_mob = ?, usr_club = ? WHERE usr_id = ?',
            [full_name, mobile, club, userId]
        );
        
        res.redirect('/profile');
    } catch (error) {
        console.log(error);
        res.render('profile', { user: req.body, errorMessage: 'Error updating profile.' });
    }
});

module.exports = router;
