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

// forgot-passowrd route
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// forgot-passowrd reset using token route
router.get('/forgot-password/:Token', (req, res) => {
    res.render('forgot-password-request');
});

// Signup-waiting page
router.get('/signup-waiting', (req, res) => {
    res.render('signup-waiting');
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

// User-management page
router.get('/user-management', (req, res) => {
    res.render('user-management');
});

// Inventory-management page
router.get('/inventory', (req, res) => {
    res.render('inventory');
});

module.exports = router;