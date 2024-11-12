const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const fs = require("fs"); // Import the fs module
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync("./models/ca.pem") // Make sure ca.pem file is in the correct directory
  }
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

module.exports = pool;
