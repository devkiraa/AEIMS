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
            ud.usr_cre_date 
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

// Route to update user details
router.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { usr_role, usr_dept, usr_stat } = req.body;

    const sql = `
        UPDATE users 
        SET usr_role = ?, usr_dept = ?, usr_stat = ? 
        WHERE usr_id = ?`;

    db.query(sql, [usr_role, usr_dept, usr_stat, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update user data' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

module.exports = router;
