const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const path = require('path');
const db = require('../models/db'); // Ensure correct import of your database connection

// Configure Multer for file upload (Event Poster)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp to avoid duplicates
    }
});

const upload = multer({ storage: storage });

// Route to create an event
router.post('/create', upload.single('event_poster'), (req, res) => {
    const {
        evn_name,
        event_sd,
        evn_st,
        evn_ed,
        event_et,
        ven_id,
        evn_desc,
        evn_vol_cnt,
        evn_snk,
        evn_food,
        evn_stat
    } = req.body;

    // If an event poster was uploaded, use its path
    const event_poster = req.file ? req.file.filename : null;

    // SQL query to insert the event into the database
    const sql = `
        INSERT INTO event_tb 
        (evn_name, event_sd, evn_st, evn_ed, event_et, ven_id, evn_desc, event_poster, evn_vol_cnt, evn_snk, evn_food, evn_stat) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        evn_name,
        event_sd,
        evn_st,
        evn_ed,
        event_et,
        ven_id,
        evn_desc,
        event_poster,
        evn_vol_cnt || null, // Optional field
        evn_snk,
        evn_food,
        evn_stat
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while creating the event');
        }
        console.log('Event successfully created with ID:', result.insertId);
        res.json({ message: 'Event created successfully!' });
    });
});

// Export the router
module.exports = router;
 