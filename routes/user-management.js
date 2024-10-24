const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Ensure correct import of your database connection

// Backend route to fetch all users
router.get('/users', (req, res) => {
    const sql = `
        SELECT 
            u.usr_name, 
            u.usr_role, 
            u.usr_dept, 
            ud.usr_aname, 
            ud.usr_mob, 
            ud.usr_cre_date 
        FROM users u 
        JOIN user_details ud 
        ON u.usr_id = ud.usr_id`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

module.exports = router;
