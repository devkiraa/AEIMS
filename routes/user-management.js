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

// Route to update user details or restore a user
router.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { usr_role, usr_dept, usr_stat, restore } = req.body;

    try {
        if (restore) {
            // Restore logic: Update status to '1' (Active) and clear delete date
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

            res.json({ message: 'User updated successfully' });
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
