# Dr. Hanif Dental Care - Full Stack Website

A complete full-stack dental clinic website built with Node.js, Express, and MongoDB (MERN stack without React).

## 🌟 Features

### Frontend
- **Homepage** with hero section, services overview, testimonials, and clinic info
- **About Page** with doctor profile, qualifications, and mission statement
- **Services Page** displaying all dental services with prices
- **Appointment Booking** with date/time selection and service choice
- **Contact Page** with contact form and clinic information
- **Patient Login/Register** for account creation and authentication
- **My Appointments** page for patients to view their appointment history
- **Admin Panel** for doctors to manage appointments, services, and patients
- **Responsive Design** that works on desktop, tablet, and mobile

### Backend
- **User Authentication** with JWT tokens and password hashing
- **Appointment Management** CRUD operations for appointments
- **Service Management** Admin can add, edit, and delete services
- **Patient Database** Secure storage of patient information
- **Protected Routes** Role-based access control (Admin/Patient)

### Database
- MongoDB with Mongoose ODM
- Collections: Users, Appointments, Services

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Validation**: express-validator
- **Environment Variables**: dotenv
- **CORS**: cors middleware
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## 📁 Project Structure

```
Dental care/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   └── serviceController.js
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authentication
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Service.js
│   │   └── User.js
│   └── routes/
│       ├── appointmentRoutes.js
│       ├── authRoutes.js
│       └── serviceRoutes.js
├── frontend/
│   ├── css/
│   │   └── style.css           # Main stylesheet
│   ├── js/
│   │   ├── main.js             # Main JavaScript
│   │   └── admin.js            # Admin panel JavaScript
│   ├── pages/
│   │   ├── about.html
│   │   ├── admin-panel.html    # Doctor's admin panel
│   │   ├── book-appointment.html
│   │   ├── contact.html
│   │   ├── login.html
│   │   ├── my-appointments.html # Patient appointments
│   │   ├── register.html
│   │   └── services.html
│   └── index.html              # Homepage
├── .env                        # Environment variables
├── package.json
└── server.js                   # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or navigate to project directory**
   ```bash
   cd "Dental care"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dental_clinic
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   ```

4. **Start MongoDB**
   - For local MongoDB: Make sure MongoDB service is running
   - For MongoDB Atlas: Use your connection string

5. **Seed initial data (optional)**
   ```bash
   node backend/seeds/seed.js
   ```

6. **Start the server**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

7. **Open your browser**
   Visit: `http://localhost:5000`

## 🔐 Default Admin Account

To create an admin account, register a new user and then manually update the role in MongoDB:

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/patients` - Get all patients (admin only)

### Appointments
- `POST /api/appointments` - Create new appointment (public)
- `GET /api/appointments` - Get all appointments (admin only)
- `GET /api/appointments/my-appointments` - Get user's appointments (protected)
- `PUT /api/appointments/:id/status` - Update appointment status (admin only)
- `DELETE /api/appointments/:id` - Delete appointment (admin only)

### Services
- `GET /api/services` - Get all services (public)
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

## 📱 Pages Overview

### Public Pages
- **Homepage** (`/`) - Landing page with hero section and services overview
- **About** (`/pages/about.html`) - Doctor profile and clinic information
- **Services** (`/pages/services.html`) - List of all dental services
- **Contact** (`/pages/contact.html`) - Contact form and clinic details
- **Book Appointment** (`/pages/book-appointment.html`) - Appointment booking form
- **Login** (`/pages/login.html`) - User login
- **Register** (`/pages/register.html`) - User registration

### Protected Pages
- **My Appointments** (`/pages/my-appointments.html`) - View patient appointments
- **Admin Panel** (`/pages/admin-panel.html`) - Manage appointments, services, patients

## 🎨 Features in Detail

### Appointment Booking Process
1. User fills appointment form with personal details
2. Selects service from dropdown (populated from database)
3. Chooses date and time slot
4. Submits booking request
5. Admin receives pending appointment notification
6. Admin approves/cancels appointment
7. Patient can view appointment status

### Admin Panel Features
- **Dashboard Overview**: View appointment statistics
- **Manage Appointments**: Approve, complete, or delete appointments
- **Services Management**: Add, edit, and delete services
- **Patients List**: View all registered patients
- **Real-time Updates**: All changes reflect immediately

### Patient Portal
- **Login/Register**: Secure authentication system
- **My Appointments**: View appointment history with status
- **Track Status**: See if appointments are pending, approved, or completed
- **Book More**: Easy access to booking page

## 🔒 Security Features

- Passwords are hashed using bcryptjs before storage
- JWT tokens for secure authentication
- Protected routes with role-based access control
- Input validation using express-validator
- CORS enabled for cross-origin requests
- Environment variables for sensitive data

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📞 Support

For issues and questions:
1. Check the console for any JavaScript errors
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check that dependencies are installed

## 📝 License

This project is created for educational purposes.

## 🤝 Contributing

Feel free to customize and extend this project:
- Add email notifications
- Implement payment integration
- Add more services
- Enhance UI/UX
- Add appointment reminders

## 🎉 What's Next?

You can enhance this project by adding:
- Email notifications using Nodemailer
- SMS/WhatsApp notifications
- Online payment integration
- Appointment calendar view
- File uploads for X-rays/documents
- Multi-doctor support
- Medical history tracking
- Prescription management
