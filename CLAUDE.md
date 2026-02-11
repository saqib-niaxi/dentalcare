# CLAUDE.md

## Project Overview
MERN dental clinic website: React + Vite + Tailwind frontend, Node.js + Express + MongoDB backend. Handles appointments, services, and notifications (WhatsApp + email).

## URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Commands
```bash
# Backend (from root)
npm run dev

# Frontend
cd frontend && npm run dev

# Seed database
node backend/seeds/seed.js
```

## Structure
- `backend/` - Express API (controllers, models, routes, utils)
- `frontend/src/` - React SPA (api, components, context, hooks, pages)

## Key Files
- Auth: `backend/controllers/authController.js`, `frontend/src/context/AuthContext.jsx`
- Appointments: `backend/controllers/appointmentController.js`
- Admin Panel: `frontend/src/pages/admin/`

## Environment (.env)
```
MONGODB_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS, CALLMEBOT_API_KEY, ADMIN_WHATSAPP_NUMBER
```

## Auth
- JWT in localStorage, roles: `patient` | `admin`
- Admin: `admin@ahmeddental.com` / `admin123`

## Notes
- Modal component: use `dark` prop for admin panel
- Notifications: Email (Nodemailer) 