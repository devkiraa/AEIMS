const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to generate a random string of letters and numbers
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Function to generate a unique filename
async function generateUniqueFilename(originalname) {
    const ext = path.extname(originalname);
    let baseName = path.basename(originalname, ext);
    let uniqueName = `${generateRandomString(15)}-${Date.now()}${ext}`;
    
    // Check if the file already exists
    while (fs.existsSync(path.join(uploadsDir, uniqueName))) {
        uniqueName = `${generateRandomString(15)}-${Date.now()}${ext}`;
    }

    return uniqueName;
}

// Define the uploads directory path (outside the current directory)
const uploadsDir = path.join(__dirname, '../uploads'); // Adjust the path as needed

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // Create the uploads directory if it doesn't exist
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Directory to save uploaded files
    },
    filename: async (req, file, cb) => {
        const uniqueFilename = await generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename); // Save the file with the unique name
    }
});

const upload = multer({ storage: storage });

// Endpoint to handle file uploads
router.post('/upload-file', upload.single('eventPoster'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Construct the URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Send the URL back to the client
    res.json({ url: fileUrl });
});

module.exports = router;