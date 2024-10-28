const express = require('express');
const mysql = require('mysql');
const multer = require('multer'); // For handling file uploads
const path = require('path');
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up the MySQL connection
const db = mysql.createConnection({
    host: 'localhost',  // Change according to your database configuration
    user: 'root',
    password: 'password',
    database: 'aeims'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Configure Multer for file upload (Event Poster)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Store files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Rename file with timestamp to avoid duplicates
    }
});

const upload = multer({ storage: storage });

// POST route to handle event creation form
app.post('/events/create', upload.single('event_poster'), (req, res) => {
    const {
        event_title,
        start_date,
        start_time,
        end_date,
        end_time,
        venue,
        event_description,
        event_volunteers,
        event_coordinators,
        guest_counter,
        volunteer_counter,
        event_food,
    } = req.body;

    // Handle boolean fields for volunteers and food
    const volunteerRequired = event_volunteers === 'yes' ? 1 : 0;
    const foodRequired = event_food === 'yes' ? 1 : 0;

    // Prepare the SQL query for inserting event data
    const sql = `INSERT INTO events_tb (event_name, event_start_date, event_start_time, event_end_date, event_end_time, event_description, volunteer_required, guest_count, food_provided, venue_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Execute the SQL query
    db.query(sql, [event_title, start_date, start_time, end_date, end_time, event_description, volunteerRequired, guest_counter, foodRequired, venue], (err, result) => {
        if (err) {
            console.error('Error inserting event into the database:', err);
            return res.status(500).send('Database error');
        }

        console.log('Event inserted into the database:', result);
        res.status(200).send('Event details saved successfully');
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
