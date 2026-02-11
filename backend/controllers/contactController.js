const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @desc    Send contact form message
// @route   POST /api/contact
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Send email to clinic
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'saqib2021@namal.edu.pk', // Your email
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0077b6; margin: 0;">Dr. Ahmed Dental Care</h1>
            <p style="color: #666;">New Contact Form Submission</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #0077b6; margin-top: 0;">Message Details</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Name:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Email:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                  <a href="mailto:${email}" style="color: #0077b6; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Phone:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${phone || 'Not provided'}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #0077b6;">Message:</h3>
            <p style="line-height: 1.6; white-space: pre-wrap; color: #333;">${message}</p>
          </div>

          <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
            <p>This is an automated email from the contact form.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const confirmationEmail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We Received Your Message - Dr. Ahmed Dental Care',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0077b6; margin: 0;">Dr. Ahmed Dental Care</h1>
            <p style="color: #666;">Your Trusted Dental Partner</p>
          </div>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #155724; margin: 0;">✅ Message Received!</h2>
          </div>

          <p>Dear <strong>${name}</strong>,</p>

          <p>Thank you for contacting us! We have received your message and will get back to you as soon as possible.</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #0077b6;">Your Message Summary:</h3>
            <p style="color: #333; line-height: 1.6;">
              <strong>Email:</strong> ${email}<br>
              <strong>Phone:</strong> ${phone || 'Not provided'}<br><br>
              <em>"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"</em>
            </p>
          </div>

          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <strong>📞 Quick Contact:</strong>
            <p style="margin: 10px 0 0 0;">If you need immediate assistance:</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> +92 320 2067666</p>
            <p style="margin: 5px 0;"><strong>Emergency:</strong> +92 300 6089947</p>
          </div>

          <p>We appreciate your inquiry and look forward to serving you!</p>

          <p>Best regards,<br><strong>Dr. Ahmed Dental Care Team</strong></p>

          <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
            <p>📍 123 Main Street, Gulshan-e-Iqbal, Karachi</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(confirmationEmail);

    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

// @desc    Check available time slots for a date
// @route   GET /api/contact/available-slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Sunday check
    if (dayOfWeek === 0) {
      return res.json({
        success: true,
        closed: true,
        message: 'Clinic is closed on Sundays',
        availableSlots: []
      });
    }

    // Generate all slots based on day
    const allSlots = [];
    const endHour = dayOfWeek === 6 ? 14 : 18; // Saturday: 2 PM, else 6 PM

    for (let hour = 9; hour < endHour; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour - 1) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    // Find booked slots
    const dateStr = selectedDate.toISOString().split('T')[0];
    const bookedAppointments = await Appointment.find({
      date: { $gte: new Date(`${dateStr}T00:00:00`), $lt: new Date(`${dateStr}T23:59:59`) },
      status: { $ne: 'cancelled' }
    });

    const bookedSlots = bookedAppointments.map(apt => apt.time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      closed: false,
      availableSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots'
    });
  }
};

// @desc    Submit chatbot appointment request
// @route   POST /api/contact/chatbot-appointment
exports.submitChatbotAppointment = async (req, res) => {
  try {
    const { name, phone, email, appointmentType, date, time } = req.body;

    // Validation
    if (!name || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, date, and time'
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Sunday check
    if (dayOfWeek === 0) {
      return res.status(400).json({
        success: false,
        message: 'Clinic is closed on Sundays'
      });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDateOnly = new Date(selectedDate);
    appointmentDateOnly.setHours(0, 0, 0, 0);

    if (appointmentDateOnly < tomorrow) {
      return res.status(400).json({
        success: false,
        message: 'Appointments can only be booked from tomorrow onwards'
      });
    }

    // Validate time based on day
    const [hours] = time.split(':').map(Number);
    const endHour = dayOfWeek === 6 ? 14 : 18;
    if (hours < 9 || hours >= endHour) {
      return res.status(400).json({
        success: false,
        message: dayOfWeek === 6
          ? 'Saturday hours: 9:00 AM - 2:00 PM'
          : 'Weekday hours: 9:00 AM - 6:00 PM'
      });
    }

    // Check if slot is already booked
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existingAppointment = await Appointment.findOne({
      date: { $gte: new Date(`${dateStr}T00:00:00`), $lt: new Date(`${dateStr}T23:59:59`) },
      time: time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please select another time.'
      });
    }

    // Create or find patient
    let patient = null;
    let tempPassword = null;
    let isNewPatient = false;

    if (email) {
      // Check if patient already exists by email
      patient = await User.findOne({ email: email.toLowerCase() });

      if (!patient) {
        // Check by phone
        patient = await User.findOne({ phone: phone });
      }
    } else {
      // No email, check by phone only
      patient = await User.findOne({ phone: phone });
    }

    if (!patient && email) {
      // Create new patient with temporary password
      tempPassword = crypto.randomBytes(4).toString('hex'); // 8 character password

      patient = new User({
        name: name,
        email: email.toLowerCase(),
        phone: phone,
        password: tempPassword,
        role: 'patient',
        isEmailVerified: false
      });

      await patient.save();
      isNewPatient = true;
      console.log('New patient created via chatbot:', patient._id);
    }

    // Save appointment to database
    const newAppointment = new Appointment({
      patient: patient ? patient._id : null,
      guestInfo: {
        name: name,
        phone: phone,
        email: email || null
      },
      serviceType: appointmentType || 'General Consultation',
      date: selectedDate,
      time: time,
      status: 'pending',
      source: 'chatbot',
      notes: `Booked via chatbot. Service: ${appointmentType || 'General Consultation'}`
    });

    await newAppointment.save();
    console.log('Chatbot appointment saved to database:', newAppointment._id);

    // Format date for email
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format time for display
    const [h, m] = time.split(':');
    const hour12 = parseInt(h) > 12 ? parseInt(h) - 12 : parseInt(h) === 0 ? 12 : parseInt(h);
    const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hour12}:${m} ${ampm}`;

    // Send email to clinic
    const clinicEmail = {
      from: process.env.EMAIL_USER,
      to: 'saqib2021@namal.edu.pk',
      subject: `New Chatbot Appointment Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0077b6; margin: 0;">Dr. Ahmed Dental Care</h1>
            <p style="color: #666;">New Appointment Request via Chatbot</p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #856404; margin: 0;">📅 New Appointment Request</h2>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Patient Name:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Phone:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${phone}</td>
              </tr>
              ${email ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Email:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Appointment Type:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${appointmentType || 'General Consultation'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Requested Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Requested Time:</strong></td>
                <td style="padding: 10px 0;">${formattedTime}</td>
              </tr>
            </table>
          </div>

          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <strong>⚠️ Action Required:</strong>
            <p style="margin: 10px 0 0 0;">Please contact the patient to confirm this appointment.</p>
          </div>

          <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
            <p>This request was submitted via the website chatbot.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(clinicEmail);

    // Send confirmation to patient (if email provided)
    if (email) {
      // Account credentials section for new patients
      const accountSection = isNewPatient ? `
            <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">🎉 Your Patient Account Created!</h3>
              <p style="margin: 10px 0;">We've created an account for you to track your appointments online.</p>
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e9ecef;"><strong>Email:</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px;"><strong>Temporary Password:</strong></td>
                  <td style="padding: 12px; font-family: monospace; font-size: 16px; color: #2e7d32; font-weight: bold;">${tempPassword}</td>
                </tr>
              </table>
              <p style="margin: 15px 0 5px 0; font-size: 14px;">👉 <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="color: #0077b6;">Login to your account</a> to view and manage your appointments.</p>
              <p style="margin: 5px 0; font-size: 13px; color: #666;">⚠️ Please change your password after first login for security.</p>
            </div>
      ` : '';

      const patientEmail = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: isNewPatient
          ? 'Welcome! Your Account & Appointment Request - Dr. Ahmed Dental Care'
          : 'Appointment Request Received - Dr. Ahmed Dental Care',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0077b6; margin: 0;">Dr. Ahmed Dental Care</h1>
              <p style="color: #666;">Your Trusted Dental Partner</p>
            </div>

            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #155724; margin: 0;">✅ Appointment Request Received!</h2>
            </div>

            <p>Dear <strong>${name}</strong>,</p>

            <p>Thank you for your appointment request! We have received your booking details and our team will contact you shortly to confirm.</p>

            ${accountSection}

            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #0077b6; margin-top: 0;">Your Request Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Appointment Type:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${appointmentType || 'General Consultation'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Requested Date:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Requested Time:</strong></td>
                  <td style="padding: 10px 0;">${formattedTime}</td>
                </tr>
              </table>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <strong>⏰ What's Next?</strong>
              <p style="margin: 10px 0 0 0;">Our team will call you within 2 hours during business hours to confirm your appointment.</p>
            </div>

            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <strong>📞 Questions?</strong>
              <p style="margin: 10px 0 0 0;">Contact us directly:</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> +92 320 2067666</p>
              <p style="margin: 5px 0;"><strong>Emergency:</strong> +92 300 6089947</p>
            </div>

            <p>We look forward to seeing you!</p>

            <p>Best regards,<br><strong>Dr. Ahmed Dental Care Team</strong></p>

            <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
              <p>📍 123 Main Street, Gulshan-e-Iqbal, Karachi</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(patientEmail);
    }

    res.json({
      success: true,
      message: 'Appointment request submitted successfully! We will contact you shortly to confirm.'
    });
  } catch (error) {
    console.error('Chatbot appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit appointment request. Please try again.'
    });
  }
};
