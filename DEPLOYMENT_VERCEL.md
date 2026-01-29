# Deployment Plan - Vercel

This plan outlines the steps to deploy the Dental Care application (Full-stack) to Vercel.

## 1. Backend Adjustments
- Modify `backend/server.js` to export the Express `app`.
- Ensure it doesn't block with `app.listen()` when running in a serverless environment (optional but recommended).

## 2. Root Configuration
- Add `vercel.json` to the root directory to handle:
    - Routing all `/api/*` requests to the backend.
    - Routing everything else to the built frontend.
- Update root `package.json` to include a build script that builds the frontend.

## 3. Environment Variables
- Set up the following in Vercel Dashboard:
    - `MONGODB_URI`
    - `JWT_SECRET`
    - `EMAIL_PASS`
    - `EMAIL_USER`
    - `TWILIO_ACCOUNT_SID`
    - `TWILIO_AUTH_TOKEN`
    - etc.

## 4. Deployment Steps
1. Push code to GitHub.
2. Link project in Vercel.
3. Deploy.
