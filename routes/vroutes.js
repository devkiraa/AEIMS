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

// Signup-waiting page
router.get('/user-management', (req, res) => {
    res.render('user-management');
});

module.exports = router;