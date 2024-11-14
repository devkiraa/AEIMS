const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Assuming you have a db connection module

router.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId; // Assuming session contains user ID

        // Fetch user data, adjusting to fetch the correct column 'usr_aname' for full name
        const [user] = await db.query(`
            SELECT 
            u.usr_name,  
            u.usr_dept,
            ud.usr_aname, 
            ud.usr_mob, 
            ud.usr_club,
            ud.usr_cre_date,
        FROM users u 
        JOIN user_details ud 
        ON u.usr_id = ud.usr_id WHERE usr_id = ?`, [userId]);
        console.log(user,"hello");

        // Send user data to the profile page
        res.render('profile', {
            user, // Ensure the correct user data is passed
            userRole: req.session.role, // assuming role is stored in session
            message: req.session.message || null,
            errorMessage: req.session.errorMessage || null
        });
        req.session.message = null;
        req.session.errorMessage = null;
    } catch (err) {
        console.error(err);
        res.render('profile', {
            errorMessage: 'Unable to load profile information.'
        });
    }
});

router.post('/profile', async (req, res) => {
    const { full_name, email, mobile, dept, club } = req.body;
    const userId = req.session.userId;

    try {
        // Update user details in database
        await db.query('UPDATE users SET usr_aname = ?, usr_name = ?, mobile = ?, dept = ?, club = ? WHERE usr_id = ?',
            [full_name, email, mobile, dept, club, userId]);

        req.session.message = 'Profile updated successfully!';
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.session.errorMessage = 'Error updating profile.';
        res.redirect('/profile');
    }
});

module.exports = router;
