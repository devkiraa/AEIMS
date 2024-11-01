const express = require('express');
const router = express.Router();

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Forgot-password route
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// Forgot-password reset using token route
router.get('/forgot-password/:Token', (req, res) => {
    res.render('forgot-password-request');
});

// Forgot-password-request page
router.get('/forgot-password-request', (req, res) => {
    res.render('forgot-password-request');
});

// Signup-waiting page
router.get('/signup-waiting', (req, res) => {
    res.render('signup-waiting');
});

// Dashboard page
router.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// Create Event page
router.get('/create-event', (req, res) => {
    res.render('booking-page');
});

// My Events page
router.get('/my-events', (req, res) => {
    res.render('event-approval-page');
});

// Profile page
router.get('/profile', (req, res) => {
    res.render('profile');
});

// Change Password page
router.get('/change-password', (req, res) => {
    res.render('change-password');
});

// Logout route
router.get('/logout', (req, res) => {
    // Clear session and redirect to login
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// User-management page
router.get('/user-management', (req, res) => {
    res.render('user-management');
});

// Inventory-management page
router.get('/inventory', (req, res) => {
    res.render('inventory');
});

// Booking page
router.get('/book-event', (req, res) => {
    res.render('booking-page');
});

// Event details page
router.get('/book-event/event-details', (req, res) => {
    res.render('event-detail');
});

// Guest details page
router.get('/book-event/guest-details', (req, res) => {
    res.render('guest-details');
});

// Resource selection page
router.get('/book-event/resource', (req, res) => {
    res.render('resource-selection');
});

module.exports = router;
