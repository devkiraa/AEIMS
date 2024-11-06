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
            const dept = user[0]?.usr_role;

            if (usr_stat === '1' && email && dept === 'regw' && !(usr_role === 'regw')) {
                const emailResponse = await fetch(`${req.protocol}://${req.get('host')}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: "Account Approval Notification",
                        recipient: email,
                        body: `<p>Hey ${useraname[0].usr_aname},</p><p>Your registration has been approved! You can now access your account.</p>`,
                        isHtml: true
                    })
                });
            
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
