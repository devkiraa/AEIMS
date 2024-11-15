const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection using promise-based mysql2

// Route to fetch all users with role and department transformation
router.get('/users', async (req, res) => {
    const sql = `
        SELECT 
            u.usr_id,
            u.usr_name, 
            CASE 
                WHEN u.usr_role = 'regw' THEN 'Pending'
                WHEN u.usr_role = 'admin' THEN 'Admin'
                WHEN u.usr_role = 'ev' THEN 'Viewer'
                WHEN u.usr_role = 'em' THEN 'Manager'
                WHEN u.usr_role = 'hod' THEN 'HOD'
                ELSE u.usr_role
            END AS usr_role, 
            CASE 
                WHEN u.usr_dept = 'cs' THEN 'CS & IT'
                WHEN u.usr_dept = 'vm' THEN 'VM'
                WHEN u.usr_dept = 'phs' THEN 'PS'
                WHEN u.usr_dept = 'math' THEN 'Mathematics'
                WHEN u.usr_dept = 'com' THEN 'Commerce'
                WHEN u.usr_dept = 'eng' THEN 'English'
                ELSE u.usr_dept
            END AS usr_dept, 
            CASE 
                WHEN u.usr_stat = '0' THEN 'Disabled'
                WHEN u.usr_stat = '1' THEN 'Active'
                WHEN u.usr_stat = '-1' THEN 'Deleted'
                ELSE 'Unknown'
            END AS usr_stat,
            ud.usr_aname, 
            ud.usr_mob, 
            ud.usr_club,
            ud.usr_cre_date, 
            ud.usr_del_date
        FROM users u 
        JOIN user_details ud 
        ON u.usr_id = ud.usr_id
        ORDER BY ud.usr_aname ASC`;

    try {
        const [results] = await db.query(sql); // Await the query to resolve
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});


router.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { usr_role, usr_dept, usr_stat, restore } = req.body;

    try {
        if (restore) {
            // Restore logic
            const [result] = await db.query(`UPDATE users SET usr_stat = '1' WHERE usr_id = ?`, [userId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            await db.query(`UPDATE user_details SET usr_del_date = NULL WHERE usr_id = ?`, [userId]);
            res.json({ message: 'User restored successfully' });
        } else {
            // Fetch the usr_name (email) from the database for the given userId
            const [user] = await db.query(`SELECT usr_name, usr_role FROM users WHERE usr_id = ?`, [userId]);
            const [useraname] = await db.query(`SELECT usr_aname FROM user_details WHERE usr_id = ?`, [userId]);

            // Update user details logic
            const [result] = await db.query(
                `UPDATE users SET usr_role = ?, usr_dept = ?, usr_stat = ? WHERE usr_id = ?`,
                [usr_role, usr_dept, usr_stat, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const email = user[0]?.usr_name;  // Access usr_name as the email
            const role = user[0]?.usr_role;

            if ((usr_stat === '1' || usr_stat === '0') && email && role === 'regw' && !(usr_role === 'regw')) {

                // Update user details logic
                const [sresult] = await db.query(
                    `UPDATE users SET usr_stat = ? WHERE usr_id = ?`,
                    [1, userId]
                );

                if (sresult.affectedRows === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const emailResponse = await fetch(`https://incredible-fanchette-startupsprint-16da87c3.koyeb.app/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "subject": "Account Approval Notification",
                        "recipient": email,
                        "body": `
                            <html>
                                <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; color: #333;">
                                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                        <h2 style="color: #1d4ed8; text-align: center;">Hello ${useraname[0].usr_aname},</h2>
                                        <p style="font-size: 1rem; color: #555; text-align: center;">
                                            Your registration has been approved! You can now access your account and explore all the features available.
                                        </p>
                                        <p style="font-size: 1rem; color: #555; text-align: center;">
                                            We are excited to have you onboard and look forward to your contributions.
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

                // Log the email sending status
                const status = 'Sent';
                const now = new Date();
                const mail_date = now.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                const mail_time = now.toTimeString().split(' ')[0]; // Format as HH:MM:SS

                // Insert log into mail_log table
                await db.query(
                    `INSERT INTO mail_log (mail_kind, mail_date, mail_time, mail_stat, usr_id, receiver_email)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    ["user approval", mail_date, mail_time, status, userId, email]
                );

                if (!emailResponse.ok) {
                    console.error(`Error sending approval email: ${emailResponse.message}`);
                    return res.status(500).send('Error sending email');
                } else {
                    res.send('User updated successfully and approval email was sent successfully.');
                }
            } else {
                console.log('User updated successfully, but no approval email sent');  // Log for missing email or inactive status
                res.json({ message: 'User updated successfully, but no approval email sent' });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user data' });
    }
});

// Route to delete a user
router.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const [result] = await db.query(`UPDATE users SET usr_stat = '-1' WHERE usr_id = ?`, [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.query(`UPDATE user_details SET usr_del_date = CURRENT_DATE WHERE usr_id = ?`, [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
