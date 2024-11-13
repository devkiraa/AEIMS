const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const router = express.Router();

// Calculate expiry time (10 minutes from now)
function calculateExpiry() {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in milliseconds
}

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    const { email, mobile } = req.body;

    try {
        // Check if the email and mobile exist in the database
        const [user] = await db.query(
            `SELECT u.usr_id FROM users u
             JOIN user_details ud ON u.usr_id = ud.usr_id
             WHERE u.usr_name = ? AND ud.usr_mob = ?`,
            [email, mobile]
        );

        if (!user || user.length === 0) {
            return res.status(404).send("User not found. Please check your email and mobile.");
        }

        const usr_id = user[0].usr_id;
        // Generate reset token and set expiry time to 10 minutes
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = calculateExpiry();

        // Insert or update the reset token, expiry, and increment reset count
        await db.query(
            `INSERT INTO password_resets (usr_id, reset_token, reset_token_expiry, reset_link_stat)
             VALUES (?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE 
                reset_token = VALUES(reset_token), 
                reset_token_expiry = VALUES(reset_token_expiry), 
                reset_link_stat = reset_link_stat + 1`,
            [usr_id, resetToken, resetTokenExpiry]
        );

        // Prepare the reset link
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // Send reset email
        const emailResponse = await fetch("http://127.0.0.1:5000/send-email", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "subject": 'Password Reset Request',
                "recipient": email,
                "body": `
                    <html>
                        <body style='font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; color: #333;'>
                            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);'>
                                <h2 style='text-align: center; color: #1d4ed8;'>Password Reset Request</h2>
                                <p style='font-size: 1rem; color: #1d4ed8; text-align: center;'>You requested a password reset. Please click the button below to reset your password:</p>
                                <div style='text-align: center; margin-top: 20px;'>
                                    <a href="${resetLink}" style='display: inline-block; padding: 10px 20px; background-color: #1d4ed8; color: white; border: none; border-radius: 5px; text-decoration: none; font-size: 1rem;'>Reset Password</a>
                                </div>
                                <p style='font-size: 0.9rem; color: #333; text-align: center; margin-top: 20px;'>This link is valid for <strong>10 minutes</strong>. If you did not request this reset, you may ignore this email.</p>
                                <p style='font-size: 0.9rem; color: #333; text-align: center; margin-top: 20px;'>Thank you,<br>AEIMS Support Team</p>
                                <p style='font-size: 0.9rem; text-align: center; color: #1d4ed8; margin-top: 10px;'>If you have any issues, feel free to <a href='mailto:mail.aeims@gmail.com' style='color: #1d4ed8; text-decoration: underline;'>contact us</a>.</p>
                            </div>
                        </body>
                    </html>`,
                "is_html": true
            })
        });

        // Assume email status as "Sent" and prepare data for mail_log entry
        const status = 'Sent';
        const now = new Date();
        const mail_date = now.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const mail_time = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS

        // Insert log into mail_log table
        await db.query(
            `INSERT INTO mail_log (mail_kind, mail_date, mail_time, mail_stat, usr_id, receiver_email)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ["reset password", mail_date, mail_time, status, usr_id, email]
        );

        if (emailResponse.ok) {
            res.redirect('/forgot-password-request');
        } else {
            console.error('Error sending email');
            res.status(500).send('Error sending email');
        }
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).send("Internal server error. Please try again later.");
    }
});

// Route to validate token and render the reset password page
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const currentTime = new Date();

        // Validate the token and expiry in the password_resets table
        const [user] = await db.query(
            `SELECT usr_id FROM password_resets WHERE reset_token = ? AND reset_token_expiry > ? AND reset_link_stat = 1`,
            [token, currentTime]
        );

        if (!user || user.length === 0) {
            return res.status(400).send("Invalid or expired token.");
        }

        // Render the reset password page with the token
        res.render('reset-password', { token });
    } catch (error) {
        console.error("Error validating reset token:", error);
        res.status(500).send("Internal server error.");
    }
});

// Route to handle new password submission
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Find the user by token
        const [user] = await db.query(
            `SELECT usr_id FROM password_resets WHERE reset_token = ? AND reset_token_expiry > ? AND reset_link_stat = 1`,
            [token, new Date()]
        );

        if (!user || user.length === 0) {
            return res.status(400).send("Invalid or expired token.");
        }

        const usr_id = user[0].usr_id;

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Update the user's password in users table and remove the reset token
        await db.query(
            'UPDATE users SET usr_pass = ? WHERE usr_id = ?',
            [hashedPassword, usr_id]
        );

        // Delete reset token from password_resets table after successful password reset
        await db.query('UPDATE password_resets SET reset_link_stat = 0 WHERE usr_id = ?', [usr_id]);

        // Render the reset-password page with a success message
        res.render('reset-password', {
            successMessage: "Your password has been successfully reset. You can now log in."
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("Internal server error.");
    }
});

module.exports = router;
