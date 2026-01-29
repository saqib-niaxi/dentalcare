# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Full-stack MERN dental clinic website** with React + Vite + Tailwind CSS frontend and Node.js + Express + MongoDB backend. The application handles patient appointments, service management, and notifications (WhatsApp + email).

**Status**: Production-ready with React SPA frontend and complete notifications system.

**Development URLs**:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Development Commands

### Backend (Node.js/Express)
```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Seed database with sample data
node backend/seeds/seed.js
```

### Frontend (React/Vite)
```bash
# Navigate to frontend directory
cd frontend

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies (when needed)
npm install
```

### Both Servers Together
Start in two separate terminals:
1. `npm run dev` (backend)
2. `cd frontend && npm run dev` (frontend)

## Architecture Overview

### Backend Structure (`backend/`)
```
backend/
├── config/database.js          # MongoDB connection
├── controllers/                # Business logic
│   ├── authController.js      # Authentication/registration
│   ├── appointmentController.js # Appointment CRUD
│   └── serviceController.js   # Service management
├── middleware/
│   └── authMiddleware.js      # JWT verification & role checks
├── models/                    # Mongoose schemas
│   ├── User.js               # Patients & admin users
│   ├── Appointment.js        # Appointments with status
│   └── Service.js            # Dental services
├── routes/                    # Express routes
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── appointmentRoutes.js  # /api/appointments endpoints
│   └── serviceRoutes.js      # /api/services endpoints
├── utils/                     # Utilities
│   ├── email.js              # Nodemailer setup for OTP/notifications
│   └── whatsapp.js           # CallMeBot integration
├── seeds/seed.js             # Database seeding
└── server.js                 # Express app entry point
```

### Frontend Structure (`frontend/`)
React SPA with Vite and Tailwind CSS:
```
frontend/src/
├── api/                       # Axios API clients
│   ├── client.js             # Axios instance with interceptors
│   ├── auth.js               # Auth API calls
│   ├── appointments.js       # Appointment API calls
│   └── services.js           # Service API calls
├── components/
│   ├── layout/               # Layout components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   └── ui/                   # Reusable UI components
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       └── LoadingSpinner.jsx
├── context/                  # React Context providers
│   ├── AuthContext.jsx      # Authentication state
│   └── NotificationContext.jsx # Toast notifications
├── hooks/                    # Custom React hooks
│   ├── useAuth.js           # Auth state access
│   ├── useAppointments.js   # Appointment data management
│   └── useServices.js       # Service data management
├── pages/                    # Page components
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── Contact.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── BookAppointment.jsx
│   ├── MyAppointments.jsx
│   └── admin/               # Admin panel components
│       ├── AdminPanel.jsx
│       ├── AppointmentsTab.jsx
│       ├── ServicesTab.jsx
│       └── PatientsTab.jsx
└── utils/                   # Utility functions
    ├── formatters.js        # Currency/date formatting
    ├── validators.js        # Form validation
    └── icons.js            # Heroicons mapping for services
```

## Key Architectural Patterns

### Authentication & Authorization
- **JWT-based authentication** with tokens stored in localStorage
- **Role-based access control**: `patient` vs `admin` roles
- **Protected routes** using React Router guards
- **Auto-logout** on token expiration
- **Admin-only endpoints** protected by `authMiddleware.js`

### State Management
- **React Context** for global state (auth, notifications)
- **Custom hooks** for data fetching and state management
- **Local component state** for forms and UI interactions

### API Communication
- **Axios interceptors** for automatic token injection
- **Centralized API clients** in `frontend/src/api/`
- **Error handling** with toast notifications via `NotificationContext`

### Notifications System
- **Email notifications** via Nodemailer for:
  - OTP verification (registration & password reset)
  - Appointment approval/cancellation
- **WhatsApp notifications** via CallMeBot API for:
  - Instant alerts to admin when patients book appointments

### Database Models
- **User**: `name`, `email`, `password`, `role`, `isVerified`, `phone`
- **Appointment**: `patient`, `service`, `date`, `time`, `status` (`pending`/`approved`/`cancelled`)
- **Service**: `name`, `description`, `price`, `duration`

## Environment Configuration

### Backend `.env` Requirements
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CALLMEBOT_API_KEY=your_callmebot_api_key
ADMIN_WHATSAPP_NUMBER=923202067666
```

### Frontend Configuration
- **Vite proxy** configured in `vite.config.js` to route API calls to backend
- **Tailwind CSS** with custom theme in `tailwind.config.js`
- **PostCSS** for CSS processing

## Important Notes

### User Roles & Permissions
- **Admin** (`role: 'admin'`):
  - Can manage all appointments (approve/cancel)
  - Can add/edit/delete services
  - Can view all patients
  - Cannot book appointments (redirected to admin panel)

- **Patient** (`role: 'patient'`):
  - Can book appointments
  - Can view/cancel own appointments
  - Must verify email via OTP before booking

### Security Features
- **Email OTP verification** for registration and password reset
- **Password hashing** with bcryptjs
- **Input validation** with express-validator
- **CORS configured** for frontend-backend communication
- **JWT token expiration** handling

### Deployment Considerations
- Frontend built with `npm run build` (outputs to `frontend/dist/`)
- Backend serves static files from `frontend/dist/` in production
- WhatsApp notification URLs need updating for production domain
- Admin password should be changed from default `admin123`

## Common Development Workflows

### Adding a New Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add navigation link in `Navbar.jsx` if needed
4. Create API client in `frontend/src/api/` if new endpoints needed
5. Add backend route/controller if new API endpoints required

### Adding a New Service Type
1. Add icon mapping in `frontend/src/utils/icons.js` (`getServiceIcon`, `getServiceColor`)
2. Service data managed via admin panel (no code changes needed)

### Testing Notifications
1. Ensure `.env` has valid email and CallMeBot credentials
2. Use seed data or create test appointments
3. Check email inbox and WhatsApp for notifications

## Troubleshooting

### Common Issues
- **MongoDB connection errors**: Check `MONGODB_URI` in `.env`
- **Email not sending**: Verify email credentials in `.env` (use app passwords for Gmail)
- **WhatsApp notifications not working**: Confirm CallMeBot API key and admin number
- **CORS errors**: Ensure frontend is running on `localhost:3000` and backend on `localhost:5000`
- **JWT token issues**: Check token expiration and `JWT_SECRET` in `.env`

## Recent Updates (January 2026)

See `SESSION_PROGRESS.md` for detailed session progress and fixes.

### Admin Panel Redesign
- Premium dark theme with slate/amber color scheme
- Mobile responsive with hamburger menu
- Notification dropdown with pending appointments
- User menu dropdown with profile info
- Dark-themed modals for consistency

### UI Fixes Applied
- Login/Register pages: Added navbar spacing (`pt-20`)
- Hero section: Fixed GradientText visibility for "Priority"
- Modal component: Added `dark` prop and increased z-index
- All admin modals now use dark theme

### Key Component Props
- `Modal`: Use `dark` prop for dark theme in admin panel
  ```jsx
  <Modal isOpen={isOpen} onClose={onClose} title="Title" dark>
    {/* content */}
  </Modal>
  ```

### Admin Login Credentials
- Email: `admin@ahmeddental.com`
- Password: `admin123`