const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Ensure correct import of your database connection

// Route to fetch all users with role and department transformation
router.get('/users', (req, res) => {
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

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

// Route to update user details or restore a user
router.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { usr_role, usr_dept, usr_stat, restore } = req.body; // Check if it's a restore request

    let sql, values;
    
    if (restore) {
        // Restore logic: Update status to '1' (Active) and clear delete date
        sql = `UPDATE users SET usr_stat = '1' WHERE usr_id = ?`;
        values = [userId];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to restore user' });
            }

            const sql2 = `UPDATE user_details SET usr_del_date = NULL WHERE usr_id = ?`;
            db.query(sql2, values, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Failed to clear delete date');
                }
                res.json({ message: 'User restored successfully' });
            });
        });
    } else {
        // Update user details logic
        sql = `
            UPDATE users 
            SET usr_role = ?, usr_dept = ?, usr_stat = ? 
            WHERE usr_id = ?`;
        values = [usr_role, usr_dept, usr_stat, userId];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update user data' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User updated successfully' });
        });
    }
});

// Route to delete a user
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    const sql = `UPDATE users SET usr_stat = '-1' WHERE usr_id = ?`;
    const sql2 = `UPDATE user_details SET usr_del_date = CURRENT_DATE WHERE usr_id = ?`;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete user' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        db.query(sql2, [userId], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to set delete date');
            }
            res.json({ message: 'User deleted successfully' });
        });
    });
});

module.exports = router;
