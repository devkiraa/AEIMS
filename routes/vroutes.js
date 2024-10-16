const express = require('express');
const { route } = require('./auth');
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

// forgot-passowrd route
router.get('/forgot-password/:Token', (req, res) => {
    res.render('forgot-password-request');
});

// Signup-waiting page
router.get('/signup-waiting', (req, res) => {
    res.render('signup-waiting');
});

// Registration waiting page
router.get('/waiting', (req, res) => {
    res.render('waiting');
});

// 

module.exports = router;