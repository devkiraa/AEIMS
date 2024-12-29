# Amrita Event and Inventory Management System (AEIMS)

AEIMS is a comprehensive web application designed to streamline event planning and resource management for educational institutions. It offers a user-friendly interface for managing events, tracking resources, and ensuring efficient coordination within the institution.

## Features

- **User Authentication and Authorization:** Secure registration and login with role-based access control to manage user permissions effectively.

- **Event Management:** Create, schedule, and coordinate events with detailed information such as name, date, time, location, and description.

- **Participant Management:** Manage participant lists, send invitations, and track RSVPs to ensure smooth event execution.

- **Inventory Management:** Maintain a catalog of resources (e.g., equipment, materials) and allocate them to specific events, preventing overbooking and ensuring availability.

- **Notifications and Alerts:** Receive reminders about upcoming events and resource availability to keep all stakeholders informed.

- **Reporting and Analytics:** Generate reports on event attendance, participant feedback, and resource utilization to assess performance and plan future activities.

## Technologies Used

- **Backend:** Node.js with the Express framework for building the server-side application.

- **Frontend:** EJS (Embedded JavaScript) templates for rendering dynamic HTML pages.

- **Database:** MongoDB for storing user data, event details, and inventory information.

- **Authentication:** Passport.js for handling user authentication with various strategies.

- **Session Management:** Express-session middleware for managing user sessions.

- **Environment Variables:** Dotenv package for managing environment variables securely.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/devkiraa/AEIMS.git
   ```
2. **Navigate to the Project Directory:**

   ```bash
   cd AEIMS
   ```
3. **Install Dependencies:**

   ```bash
   npm install
   ```
4. **Set Up Environment Variables:**

   Create a .env file in the root directory and add the following variables:

   ```bash
   DB_HOST = your_db_host_address
   DB_USER = your_db_username
   DB_PASS = your_db_pass
   DB_NAME = your_db_name
   DB_PORT = your_db_port
   EMAIL_ADDRESS = your_email
   EMAIL_PASSWORD = your_email_app_password
   JWT_SECRET = your_session_secret
   ```

5. **Start the Application:**
   ```bash
   npm start
   ```
   The application will be running at 
   ```bash 
   http://localhost:3000
   ```
