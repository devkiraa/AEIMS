//server.js
const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// Generate a secure secret for session signing
const sessionSecret = crypto.randomBytes(64).toString("hex");

// Middleware for sessions
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour expiration
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require('./routes/auth');
const vRoutes = require('./routes/vroutes');
const userRoutes = require('./routes/user-management');
const mailerRoutes = require('./routes/mailer');
const bookingRoutes = require('./routes/venue-availability');
const quickEventRoutes = require('./routes/quick-event');
const resetPasswordRoutes = require('./routes/resetpassword');
const fileHandlerRoutes = require('./routes/fileHandler');
const inventoryRoutes = require('./routes/inventory');
const eventRoutes = require('./routes/event-approval');
const dashboardRoutes = require('./routes/dashboard');
const resourceAvailabilityRoutes = require('./routes/resourceAvailability');
const myEventsRoutes = require('./routes/myevents');
const createEventRoutes = require('./routes/createEvent');
const profileRouter = require('./routes/profile');
const editEventRouter = require('./routes/editEvent');
const changePasswordRoutes = require('./routes/changePassword');

// Use routes with prefixes to organize API routes
app.use('/api/dashboard', dashboardRoutes);
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
app.use('/api', eventRoutes);
app.use('/api', resourceAvailabilityRoutes);
app.use('/api', myEventsRoutes);
app.use('/api', createEventRoutes);
app.use('/', profileRouter);
app.use('/', editEventRouter);
app.use('/api', changePasswordRoutes);

// Set session data globally for views
app.use((req, res, next) => {
  res.locals.user_id = req.session.user_id || null;
  res.locals.user_role = req.session.user_role || null;
  res.locals.user_name = req.session.user_name || null;
  next();
});

// 404 Page Route (Must be at the end of all other routes)
app.use((req, res) => {
  res.status(404).render("404"); // Assuming you have a '404.ejs' template in your views folder
});

// Handle 403 errors with custom template
app.use((err, req, res, next) => {
  if (res.statusCode === 403) {
    res.render("403"); // Render the custom 403 page
  } else {
    next(err); // Pass the error to other error handlers if it's not 403
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
