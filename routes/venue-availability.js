const express = require('express');
const router = express.Router();
const db = require('../models/db');

// POST route to check venue availability
router.post('/check-availability', async (req, res) => {
    const { startDate, endDate, startTime, endTime } = req.body;

    // SQL query for checking venue availability
    const sql = `
        SELECT 
    v.ven_name, 
    CASE 
        WHEN COUNT(vb.ven_id) = 0 THEN 'available'  -- No bookings found
        WHEN SUM(
            CASE 
                WHEN vb.ven_stat = '1' 
                AND (
                    ? BETWEEN vb.start_date AND vb.end_date OR 
                    ? BETWEEN vb.start_date AND vb.end_date OR 
                    vb.start_date BETWEEN ? AND ? OR 
                    vb.end_date BETWEEN ? AND ?
                )
                AND (
                    ? BETWEEN vb.start_time AND vb.end_time OR 
                    ? BETWEEN vb.start_time AND vb.end_time OR 
                    vb.start_time BETWEEN ? AND ? OR 
                    vb.end_time BETWEEN ? AND ?
                )
                THEN 1 
                ELSE 0 
            END
        ) > 0 THEN 'booked'
        WHEN SUM(
            CASE 
                WHEN vb.ven_stat = '0' 
                AND (
                    ? BETWEEN vb.start_date AND vb.end_date OR 
                    ? BETWEEN vb.start_date AND vb.end_date OR 
                    vb.start_date BETWEEN ? AND ? OR 
                    vb.end_date BETWEEN ? AND ?
                )
                AND (
                    ? BETWEEN vb.start_time AND vb.end_time OR 
                    ? BETWEEN vb.start_time AND vb.end_time OR 
                    vb.start_time BETWEEN ? AND ? OR 
                    vb.end_time BETWEEN ? AND ?
                )
                THEN 1 
                ELSE 0 
            END
        ) > 0 THEN 'waiting'
        ELSE 'available'
    END AS status
FROM 
    venues v
LEFT JOIN 
    venues_bookings vb ON v.ven_id = vb.ven_id
GROUP BY 
    v.ven_name; 
    `;

    // Parameter array for SQL query
    const params = [
        startDate, endDate, startDate, endDate, startDate, endDate,
        startTime, endTime, startTime, endTime, startTime, endTime, //for booked

        startDate, endDate, startDate, endDate, startDate, endDate,
        startTime, endTime, startTime, endTime, startTime, endTime  //for waiting
    ];

    try {
        const [results] = await db.query(sql, params);

        // Transform results into a dictionary { venue_name: status }
        const venueAvailability = results.reduce((acc, row) => {
            acc[row.ven_name] = row.status;
            return acc;
        }, {});

        res.json(venueAvailability);
    } catch (err) {
        console.error('Error checking availability:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

module.exports = router;
