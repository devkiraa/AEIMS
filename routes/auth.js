const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const { full_name, mobile, email, password, club } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (full_name, mobile, email, password, club) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [full_name, mobile, email, hashedPassword, club], (err, result) => {
        if (err) throw err;
        res.redirect('/auth/waiting');
    });
});

// Registration waiting page
router.get('/waiting', (req, res) => {
    res.render('waiting');
});

module.exports = router;
