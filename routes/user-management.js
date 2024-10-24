const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Ensure correct import of your database connection

// Backend route to fetch all users with role transformation
router.get('/users', (req, res) => {
    const sql = `
        SELECT 
            u.usr_name, 
            CASE 
                WHEN u.usr_role = 'regw' THEN 'Pending'
                WHEN u.usr_role = 'admin' THEN 'Admin'
                WHEN u.usr_role = 'ev' THEN 'Viewer'
                WHEN u.usr_role = 'em' THEN 'Manager'
                WHEN u.usr_role = 'hod' THEN 'HOD'
                ELSE u.usr_role  -- In case any unexpected role exists
            END AS usr_role, 
            u.usr_dept, 
            ud.usr_aname, 
            ud.usr_mob, 
            ud.usr_cre_date 
        FROM users u 
        JOIN user_details ud 
        ON u.usr_id = ud.usr_id
        ORDER BY ud.usr_aname ASC`;  // Sort users by usr_aname in ascending order

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

module.exports = router;
