import os
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_email(subject, recipient, body):
    try:
        # Set up the MIME
        message = MIMEMultipart()
        message["From"] = EMAIL_ADDRESS
        message["To"] = recipient
        message["Subject"] = subject

        # Add body to the email
        message.attach(MIMEText(body, "plain"))

        # SMTP session
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)  # Login
            server.send_message(message)  # Send the email

        print(f"Email sent to {recipient}")

    except Exception as e:
        print(f"Error: {e}")

# Example usage for testing (remove in production)
# send_email("Test Subject", "recipient@example.com", "This is a test email")
if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: email_sender.py <subject> <recipient> <body>")
        sys.exit(1)

    subject = sys.argv[1]
    recipient = sys.argv[2]
    body = sys.argv[3]

    send_email(subject, recipient, body)