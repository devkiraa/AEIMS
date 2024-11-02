import os
import smtplib
import sys
import mysql.connector
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

def get_user_id(email):
    try:
        # Connect to the database
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cursor = connection.cursor()

        # Query to get the user ID based on the email (usr_name)
        query = "SELECT usr_id FROM users WHERE usr_name = %s"
        cursor.execute(query, (email,))
        result = cursor.fetchone()

        # Return the user ID if found, else return None
        return result[0] if result else None

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def send_email(subject, recipient, body, is_html=False):
    try:
        # Set up the MIME
        message = MIMEMultipart()
        message["From"] = EMAIL_ADDRESS
        message["To"] = recipient
        message["Subject"] = subject

        # Check if the body should be HTML or plain text
        if is_html:
            message.attach(MIMEText(body, "html"))
        else:
            message.attach(MIMEText(body, "plain"))

        # SMTP session
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)  # Login
            server.send_message(message)  # Send the email

        print(f"Email sent to {recipient}")

        # Get user ID from email
        usr_id = get_user_id(recipient)
        if usr_id is None:
            print(f"Error: User ID not found for the email address: {recipient}")
            log_email(subject, recipient, "failed")  # Log failure
            return

        # Log email info to the database
        log_email(subject, recipient, "sent", usr_id)

    except Exception as e:
        print(f"Error: {e}")
        # Log error to database
        log_email(subject, recipient, "failed")

def log_email(subject, recipient, status, usr_id):
    try:
        # Connect to the database
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cursor = connection.cursor()

        # Get current date and time
        now = datetime.now()
        mail_date = now.date()
        mail_time = now.time()

        # Insert log into mail_log table
        insert_query = """
            INSERT INTO mail_log (mail_kind, mail_date, mail_time, mail_stat, usr_id, receiver_email)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = ("email", mail_date, mail_time, status, usr_id, recipient)  # Include receiver email
        cursor.execute(insert_query, values)
        connection.commit()
        print("Email log recorded.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# CLI for execution
if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: email_sender.py <subject> <recipient> <body> [is_html]")
        sys.exit(1)

    subject = sys.argv[1]
    recipient = sys.argv[2]
    body = sys.argv[3]
    is_html = sys.argv[4].lower() == "true" if len(sys.argv) > 4 else False

    send_email(subject, recipient, body, is_html)
