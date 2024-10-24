const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const app = express();
const dotenv = require('dotenv');

// // Middleware
// dotenv.config();
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 1000 * 60 * 60, // 1 hour expiration
//         secure: process.env.NODE_ENV === 'production', // Secure in production
//         httpOnly: true // Prevent client-side JS access
//     }
// }));

// Generate a secure secret for session signing
const sessionSecret = crypto.randomBytes(64).toString('hex'); 

// MiddleWare
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

// Use the user routes with '/api' as prefix to avoid conflicts
app.use('/api', userRoutes);
app.use('/', authRoutes);
app.use('/', vRoutes);

app.get('/dashboard', (req, res) => {
    if (!req.session.user_name) {
        return res.redirect('/login'); // Redirect if user is not logged in
    }
    
    // Render the dashboard with the user's name
    res.render('dashboard', { user_name: req.session.user_name });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
