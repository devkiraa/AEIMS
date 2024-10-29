const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();

// Generate a secure secret for session signing
const sessionSecret = crypto.randomBytes(64).toString('hex'); 

// Middleware for sessions
app.use(session({
    secret: sessionSecret, // Secure session secret
    resave: false, // Save session only if modified
    saveUninitialized: false, // Avoid saving uninitialized sessions
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour expiration
        secure: process.env.NODE_ENV === 'production', // Secure in production
        httpOnly: true // Prevent client-side JS access
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const vRoutes = require('./routes/vroutes');
const userRoutes = require('./routes/user-management'); // Adjust path if necessary
const mailer = require('./routes/mailer');
const bookingRoutes = require('./routes/venue-availability');

// Use the user routes with '/api' as prefix to avoid conflicts
app.use('/api', userRoutes);
app.use('/', authRoutes);
app.use('/', vRoutes);
app.use('/api', mailer);
app.use('/api', bookingRoutes);

app.get('/', (req, res) => {
    if (!req.session.user_name) {
        return res.redirect('/login'); // Redirect if user is not logged in
    }
    
    // Render the dashboard with the user's name
    res.render('dashboard', { user_name: req.session.user_name });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
