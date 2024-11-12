const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const dotenv = require('dotenv');

// Endpoint to trigger email sending
router.post("/send-email", (req, res) => {
    const { subject, recipient, body, isHtml } = req.body;
    console.log("request recieved");

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send("Error sending email");
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.status(200).send("Email sent successfully");
    });
});

module.exports = router;