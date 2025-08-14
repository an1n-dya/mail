# CS50w Project 3: Mail

This is my attempt for the third project for the CS50w course. It is a simple web-based email client that allows users to send and receive emails.

## Features

*   **User Authentication:** Users can register for a new account and log in to their existing account.
*   **Send Mail:** Once logged in, users can compose and send emails to other registered users.
*   **Mailboxes:** Emails are organized into three mailboxes:
    *   **Inbox:** Contains all received emails that are not archived.
    *   **Sent:** Contains all sent emails.
    *   **Archive:** Contains all archived emails.
*   **View Email:** Users can click on an email to view its content. When an email is clicked, it is marked as read.
*   **Archive and Unarchive:** Users can archive and unarchive emails from the inbox.
*   **Reply:** Users can reply to an email. When replying, the original sender is automatically set as the recipient, the subject is prefixed with "Re: ", and the body is pre-filled with the original email's content.

## Getting Started

To run this project locally, follow these steps:

1.  **Apply migrations:**
    ```bash
    python manage.py migrate
    ```
2.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The application will be available at `http://127.0.0.1:8000/`.
