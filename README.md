# FlexiBook

FlexiBook is a booking and scheduling platform built for customers, businesses, and healthcare providers. The project includes a modern React frontend and a Node.js backend with API routes, authentication, appointment booking, AI symptom analysis, and queue management.

## Project Structure

- `FlexiBook/` - Frontend application built with React, Vite, and Tailwind CSS.
- `server/` - Backend application built with Express and MongoDB.

## Key Features

- Responsive customer-facing website with service search and category browsing
- User authentication and session handling for customers and business users
- Multi-step business registration workflow
- AI-powered symptom checker for healthcare guidance
- Doctor portal for live queue management and leave scheduling
- Admin complaint and feedback panel
- Real-time socket support for live queue updates
- File upload support for medical records and documents
- Payment and notification route support via backend APIs

## Frontend Overview

The frontend uses React and React Router for page navigation. Main pages include:

- Home page with service search and live queue simulation
- Customer page for booking and service discovery
- About page for company information
- Categories page to browse service categories
- Login and Signup pages for user authentication
- Business registration wizard for business profiles
- Business dashboard and doctor portal
- AI symptom checker for health condition guidance
- Admin complaint panel for internal support management

## Backend Overview

The backend is implemented with Express and Mongoose.

- Connects to MongoDB using `src/config/db.js`
- Serves upload files from `server/uploads`
- Mounts API routes under `/api/*`
- Runs socket.io for live queue updates using `src/config/socket.js`
- Includes authentication, hospital, doctor, appointment, review, complaint, payment, and AI routes

## Technology Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.io
- Utilities: dotenv, cors, bcryptjs, jsonwebtoken, multer, nodemailer, razorpay, twilio, node-cron

## Setup Instructions

1. Open a terminal in `flexibook/server`.
2. Install backend dependencies:
   ```powershell
   cd c:\Users\Pritam Pandey\OneDrive\Desktop\Git_Final\flexibook\server
   npm install
   ```
3. Copy `server/.env.example` to `server/.env` and fill in the values.
4. Start the backend server:
   ```powershell
   npm run dev
   ```
5. Open another terminal in `flexibook/FlexiBook`.
6. Copy `FlexiBook/.env.example` to `FlexiBook/.env` and fill in the values.
7. Install frontend dependencies:
   ```powershell
   cd c:\Users\Pritam Pandey\OneDrive\Desktop\Git_Final\flexibook\FlexiBook
   npm install
   ```
8. Start the frontend:
   ```powershell
   npm run dev
   ```

## Running the Project

- Backend: `npm run dev` from `flexibook/server`
- Frontend: `npm run dev` from `flexibook/FlexiBook`

After both servers are running, open the frontend URL shown by Vite in your browser.

## Environment Variables

### Backend environment variables

- `MONGO_URI` - MongoDB connection string
- `PORT` - Backend server port (default `3000`)
- `JWT_SECRET` - Secret for signing JSON Web Tokens
- `USE_IN_MEMORY` - Set to `true` to use in-memory database mode
- `GEMINI_API_KEY` - API key for AI symptom and voice features
- `RAZORPAY_KEY_ID` - Razorpay payment key
- `RAZORPAY_KEY_SECRET` - Razorpay payment secret
- `TWILIO_ACCOUNT_SID` - Twilio account SID for WhatsApp notifications
- `TWILIO_AUTH_TOKEN` - Twilio auth token for WhatsApp notifications
- `TWILIO_WHATSAPP_NUMBER` - Twilio WhatsApp sender number
- `WHATSAPP_PHONE_NUMBER` - Local WhatsApp number for the WhatsApp client
- `SMTP_HOST` or `EMAIL_HOST` - SMTP email server host
- `SMTP_PORT` or `EMAIL_PORT` - SMTP email port
- `SMTP_USER` or `EMAIL_USER` - SMTP username
- `SMTP_PASS` or `EMAIL_PASS` - SMTP password
- `DISABLE_WHATSAPP` - Set to `true` to disable WhatsApp service initialization

### Frontend environment variables

- `VITE_API_BASE_URL` - Base URL for the backend API, for example `http://localhost:3000/api`
- `VITE_RAZORPAY_KEY_ID` - Optional Razorpay key ID for payment features

> `.env` files are excluded from version control by `.gitignore`. Use the provided `.env.example` files to create your local configuration.

## Workflow Example

1. Open the site in a browser.
2. Visit the Home page and check available services.
3. Click `Sign Up` to create a customer or business account.
4. After signing in, browse categories or use the search form.
5. Use the AI Symptom Checker to get recommended specialties.
6. If you are a business owner, complete the business registration steps.
7. Doctors can access the doctor portal to manage appointments and call the next patient.

## Notes

- Authentication tokens and user data are stored in browser local storage.
- The frontend uses lazy loading and suspense for faster page transitions.
- The backend includes support for real-time socket updates and file uploads.
