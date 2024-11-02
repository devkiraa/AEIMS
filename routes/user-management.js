const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection using promise-based mysql2
const { exec } = require('child_process');

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
            // Update user details logic
            const [result] = await db.query(
                `UPDATE users SET usr_role = ?, usr_dept = ?, usr_stat = ? WHERE usr_id = ?`,
                [usr_role, usr_dept, usr_stat, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Fetch the usr_name (email) from the database for the given userId
            const [user] = await db.query(`SELECT usr_name FROM users WHERE usr_id = ?`, [userId]);
            const email = user[0]?.usr_name;  // Access usr_name as the email

            if (usr_stat === '1' && email) {
                sendApprovalEmail(email, res);  // Send email if status is active and email is found
            } else {
                console.error('Email not found or user status is not active');  // Log for missing email or inactive status
                res.json({ message: 'User updated successfully, but no approval email sent' });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user data' });
    }
});



// Function to send approval email
function sendApprovalEmail(email, res) {
    const subject = "Account Approval Notification";
    const body = "<p>Your account has been approved! You can now access the system.</p>";
    const isHtml = true;

    exec(`python3 email_sender.py "${subject}" "${email}" "${body}" "${isHtml}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error sending approval email: ${error.message}`);
            return res.status(500).json({ error: 'Failed to send approval email' });
        }
        if (stderr) {
            console.error(`Standard error: ${stderr}`);
            return res.status(500).json({ error: 'Failed to send approval email' });
        }
        console.log(`Email sent successfully: ${stdout}`);
        res.json({ message: 'User updated and approval email sent successfully' });
    });
}

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
