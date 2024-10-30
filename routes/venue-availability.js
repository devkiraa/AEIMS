const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Database connection

// POST route to check venue availability
router.post('/check-availability', (req, res) => {
    const { startDate, endDate, startTime, endTime } = req.body;

    // SQL to find booked venues in the specified date and time range
    const sql = `
    SELECT 
        v.ven_name, 
        CASE 
            WHEN COUNT(vb.ven_id) = 0 THEN 'available'  -- No bookings found
            WHEN SUM(CASE WHEN vb.ven_stat = '1' AND (
                (vb.start_date <= ? AND vb.end_date >= ?) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'booked'
            WHEN SUM(CASE WHEN vb.ven_stat = '1' AND (
                (vb.start_date >= ? AND vb.end_date <= ?) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'booked'
            WHEN SUM(CASE WHEN vb.ven_stat = '1' AND (
                (vb.start_date <= ? AND (vb.end_date <= ? AND vb.start_date <= ?)) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'booked'
            WHEN SUM(CASE WHEN vb.ven_stat = '1' AND (
                (vb.start_date >= ? AND (vb.end_date >= ? AND vb.start_date <= ?)) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'booked'
            WHEN SUM(CASE WHEN vb.ven_stat = '0' AND (
                (vb.start_date <= ? AND vb.end_date >= ?) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'waiting'
            WHEN SUM(CASE WHEN vb.ven_stat = '0' AND (
                (vb.start_date >= ? AND vb.end_date <= ?) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'waiting'
            WHEN SUM(CASE WHEN vb.ven_stat = '0' AND (
                (vb.start_date <= ? AND (vb.end_date <= ? AND vb.start_date <= ?)) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'waiting'
            WHEN SUM(CASE WHEN vb.ven_stat = '0' AND (
                (vb.start_date >= ? AND (vb.end_date >= ? AND vb.start_date <= ?)) AND 
                ((vb.start_time <= ? AND vb.end_time >= ?) OR 
                (vb.start_time >= ? AND vb.end_time <= ?) OR
                (vb.start_time <= ? AND (vb.end_time <= ? AND vb.end_time <= ?)) OR
                (vb.start_time >= ? AND (vb.end_time >= ? AND vb.start_time <= ?)))
            ) THEN 1 ELSE 0 END) > 0 THEN 'waiting'
            ELSE 'available'
        END AS status
    FROM 
        venues v
    LEFT JOIN 
        venues_bookings vb ON v.ven_id = vb.ven_id
    GROUP BY 
        v.ven_name;      
`;

    db.query(sql, [
        startDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,
        startDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,
        startDate, endDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,
        startDate, endDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,

        startDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,
        startDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,
        startDate, endDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,
        startDate, endDate, endDate, startTime, endTime, startTime, endTime, startTime, endTime, endTime, startTime, endTime, endTime,
    ], (err, results) => {
        if (err) {
            console.error('Error checking availability:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Transform results into a dictionary { venue_name: status }
        const venueAvailability = results.reduce((acc, row) => {
            acc[row.ven_name] = row.status;
            return acc;
        }, {});

        res.json(venueAvailability);
    });
});

module.exports = router;