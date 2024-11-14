const express = require('express');
const router = express.Router();
const db = require('../routes/auth');

// GET dashboard route
router.get('/', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const { user_role: userRole, user_name: userName } = req.session;
    const events = [];  // Placeholder: Fetch actual events as needed
    const inventoryItems = [];  // Placeholder: Fetch actual inventory items as needed

    res.render('dashboard', {
        userRole,
        userName,
        events,
        inventoryItems: userRole === 'admin' ? [] : inventoryItems // Hide inventory for admin on dashboard
    });
});

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup', { errorMessage: null });
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
router.get('/', (req, res) => {
    res.render('dashboard');
});

// My Events page
router.get('/my-events', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    if (req.session.user_role === 'admin' || req.session.user_role === 'em') {
        const userRole = req.session.user_role;
        const userDept = req.session.user_dept;
        res.render('myEvents', {userRole, userDept});
    } else {
        res.status(403).render(403);
    }
});

// Change Password page
router.get('/change-password', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userRole = req.session.user_role;
    const userId = req.session.user_id;
    res.render('change-password',{userRole, userId});
});

// Logout route
router.get('/logout', (req, res) => {
    // Clear session and redirect to login
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Inventory-management page
router.get('/inventory', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    if (req.session.user_role === 'admin') {
        const userRole = req.session.user_role;
        res.render('inventory', {userRole});
    } else {
        res.status(403).render(403);
    }
});

// GET profile page
router.get('/profile', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    // Check if the user is an admin
    if (req.session.user_role === 'admin') {
        const userRole = req.session.user_role;
        const message = req.session.message || null; // Get the message from the session
        const errorMessage = req.session.errorMessage || null; // Get the error message from the session
        const user = req.session.user || {};
        // Clear session messages after rendering
        req.session.message = null;
        req.session.errorMessage = null;

        // Render the profile view, passing userRole, message, and errorMessage
        res.render('profile', { userRole, message, errorMessage, user: user });
    } else {
        res.status(403).render('403');
    }
});

// Booking page
router.get('/book-event', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    if (req.session.user_role === 'admin'|| req.session.user_role === 'hod' || req.session.user_role === 'em') {
        const userRole = req.session.user_role;
        const userDept = req.session.user_dept;
        res.render('booking-page', {userRole, userDept});
    } else {
        res.status(403).render(403);
    }
});

// About page
router.get('/about-us', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    const userRole = req.session.user_role;
    res.render('aboutUs', {userRole});
});

// Event details page
router.get('/book-event/event-details', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    if (req.session.user_role === 'admin'|| req.session.user_role === 'hod' || req.session.user_role === 'em') {
        const userRole = req.session.user_role;
        const userDept = req.session.user_dept;
        const userID = req.session.user_id;
        res.render('event-detail', {userID, userRole, userDept});
    } else {
        res.status(403).render(403);
    }
});

// Guest details page
router.get('/book-event/guest-details', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    if (req.session.user_role === 'admin'|| req.session.user_role === 'hod' || req.session.user_role === 'em') {
        const userRole = req.session.user_role;
        const userDept = req.session.user_dept;
        res.render('guest-details', {userRole, userDept});
    } else {
        res.status(403).render(403);
    }
});

// Resource selection page
router.get('/book-event/resource', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    
    if (req.session.user_role === 'admin'|| req.session.user_role === 'hod' || req.session.user_role === 'em') {
        const userRole = req.session.user_role;
        const userDept = req.session.user_dept;
        res.render('resource-selection', {userRole, userDept});
    } else {
        res.status(403).render(403);
    }
});

// Approve and reject events route
router.get('/event-approval', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    if (req.session.user_role === 'admin' || req.session.user_role === 'hod') {
        const userRole = req.session.user_role;
        const userDept = req.session.user_dept;
        // Pass the events data to the template
        res.render('event-approval-page', {userRole, userDept});
    } else {
        res.status(403).render(403);
    }
});

router.get('/user-management', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }

    if (req.session.user_role === 'admin'|| req.session.user_role === 'hod') {
        const userRole = req.session.user_role;
        const userDept = req.session.user_dept;
        res.render('user-management', {userRole, userDept});
    } else {
        res.status(403).render(403);
    }
});

router.get('/guest-new',(req, res) => {
    const userRole = 'admin';
    res.render('GuestDetailsNew', {userRole});
});

module.exports = router;
