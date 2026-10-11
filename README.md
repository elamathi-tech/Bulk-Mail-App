# Bulk Mail App

A web application for sending emails to multiple recipients using React, Node.js, Express, Nodemailer, and MongoDB.

## Features

- Send emails to multiple recipients.
- Enter an email subject and message.
- Validate recipient email addresses and required fields.
- Display success or failure feedback.
- Store email records and sending status in MongoDB.
- Use Gmail SMTP through Nodemailer to send emails.

## Tech Stack

**Frontend:** React, Vite, CSS  
**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas with Mongoose  
**Email Service:** Nodemailer with Gmail SMTP


## Run Locally

### 1. Start the backend

Open a terminal and run:

```bash
cd server
npm install
node server.js
```

Configure the required environment variables in `server/.env` before starting the backend. Keep this file private and never commit it to GitHub.

### 2. Start the frontend

Open a second terminal and run:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Environment Configuration

Configure the MongoDB connection string and Gmail SMTP credentials in the backend environment. Never publish passwords, app passwords, or database credentials.

## Deployment

Live application URL: To be added after deployment.

## Repository

GitHub: https://github.com/elamathi-tech/Bulk-Mail-App

## Author

Elamathi