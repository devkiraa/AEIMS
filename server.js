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
const mailerRoutes = require('./routes/mailer');
const bookingRoutes = require('./routes/venue-availability');
const quickEventRoutes = require('./routes/quick-event');
const resetPasswordRoutes = require('./routes/resetpassword');
const fileHandlerRoutes = require('./routes/fileHandler');
const inventoryRoutes = require('./routes/inventory');
const eventRoutes = require('./routes/event-approval')
// const resetPasswordRouter = require('./routes/resetpassword');


// Use the user routes with '/api' as prefix to avoid conflicts
app.use('/api', userRoutes);
app.use('/', authRoutes);
app.use('/', vRoutes);
app.use('/api', mailerRoutes);
app.use('/api', bookingRoutes);
app.use('/api', quickEventRoutes);
app.use('/', resetPasswordRoutes);
app.use('/api', fileHandlerRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api', inventoryRoutes);
app.use('/api',eventRoutes);
// app.use('/', resetPasswordRouter);

app.use(session({
    secret: sessionSecret, // Secure session secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour expiration
        secure: process.env.NODE_ENV === 'production', // Secure in production
        httpOnly: true // Prevent client-side JS access
    }
}));


app.use((req, res, next) => {
    res.locals.user_id = req.session.user_id || null; // Set `user_id` in `res.locals`
    res.locals.user_role = req.session.user_role || null;
    res.locals.user_name = req.session.user_name || null;
    next();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
