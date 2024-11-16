// Required libraries
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../models/db'); // Database connection pool

// Route to change password
router.post('/changepassword', async (req, res) => {
    const { oldPassword, newPass } = req.body;
    const userId = req.session.user_id;

    // Input validation
    if (!oldPassword || !newPass) {
        return res.status(400).json({ error: 'Both old and new passwords are required.' });
    }

    try {
        // 1. Retrieve the stored hashed password for the user
        const [rows] = await db.query('SELECT usr_pass FROM users WHERE usr_id = ?', [userId]);

        // If no user found
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashedPassword = rows[0].usr_pass;

        // 2. Compare the old password with the stored hashed password
        const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // 3. Hash the new password
        const newHashedPassword = await bcrypt.hash(newPass, 10);

        // 4. Update the password in the database
        await db.query('UPDATE users SET usr_pass = ? WHERE usr_id = ?', [newHashedPassword, userId]);

        // Respond with success
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'An error occurred while changing password' });
    }
});

module.exports = router;
