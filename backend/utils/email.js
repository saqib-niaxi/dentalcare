const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0077b6;">Dr. Ahmed Dental Care</h2>
          <p>${message}</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="color: #0077b6; font-size: 3rem;">${otp}</h1>
            <p style="color: #666;">This OTP expires in 10 minutes.</p>
          </div>
          <p style="color: #666; font-size: 0.9rem;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Send appointment approval email
const sendAppointmentApprovalEmail = async (email, patientName, serviceName, date, time, price) => {
  try {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Appointment Approved - Dr. Ahmed Dental Care',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0077b6; margin: 0;">Dr. Ahmed Dental Care</h1>
            <p style="color: #666;">Your Trusted Dental Partner</p>
          </div>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #155724; margin: 0;">✅ Appointment Approved!</h2>
          </div>

          <p>Dear <strong>${patientName}</strong>,</p>

          <p>Great news! Your appointment has been approved. Please find the details below:</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Service:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Time:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Price:</strong></td>
                <td style="padding: 10px 0;">PKR ${price.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <strong>⏰ Please arrive 10-15 minutes early</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9rem;">This allows time for check-in and any necessary paperwork.</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #0077b6;">Clinic Location:</h3>
            <p>📍 123 Main Street, Gulshan-e-Iqbal, Karachi</p>
            <p>📞 Phone: +92 301 2345678</p>
          </div>

          <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>

          <p>We look forward to seeing you!</p>

          <p>Best regards,<br><strong>Dr. Ahmed Dental Care Team</strong></p>

          <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Appointment approval email sent to:', email);
    return true;
  } catch (error) {
    console.error('Approval email error:', error);
    return false;
  }
};

// Send appointment cancellation email
const sendAppointmentCancellationEmail = async (email, patientName, serviceName, date, time) => {
  try {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Appointment Cancelled - Dr. Ahmed Dental Care',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0077b6; margin: 0;">Dr. Ahmed Dental Care</h1>
            <p style="color: #666;">Your Trusted Dental Partner</p>
          </div>

          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #721c24; margin: 0;">❌ Appointment Cancelled</h2>
          </div>

          <p>Dear <strong>${patientName}</strong>,</p>

          <p>We regret to inform you that your appointment has been cancelled.</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Service:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Time:</strong></td>
                <td style="padding: 10px 0;">${time}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e7f3ff; border: 1px solid #b6d4fe; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <strong>📞 Need to Reschedule?</strong>
            <p style="margin: 10px 0 0 0;">Please contact us to book a new appointment:</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> +92 301 2345678</p>
            <p style="margin: 5px 0;"><strong>Emergency:</strong> +92 300 1234567</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> info@ahmeddental.com</p>
          </div>

          <p>We apologize for any inconvenience caused. We look forward to serving you soon.</p>

          <p>Best regards,<br><strong>Dr. Ahmed Dental Care Team</strong></p>

          <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
            <p>📍 123 Main Street, Gulshan-e-Iqbal, Karachi</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Appointment cancellation email sent to:', email);
    return true;
  } catch (error) {
    console.error('Cancellation email error:', error);
    return false;
  }
};

// Send pending appointment reminder email
const sendPendingAppointmentReminder = async (email, patientName, serviceName, date, time) => {
  try {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Appointment Status Update - Dr. Ahmed Dental Care',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0077b6; margin: 0;">Dr. Ahmed Dental Care</h1>
            <p style="color: #666;">Your Trusted Dental Partner</p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #856404; margin: 0;">⏳ Appointment Still Pending</h2>
          </div>

          <p>Dear <strong>${patientName}</strong>,</p>

          <p>We wanted to inform you that your appointment is still pending. The doctor has not accepted your appointment yet.</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Service:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Time:</strong></td>
                <td style="padding: 10px 0;">${time}</td>
              </tr>
            </table>
          </div>

          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <strong>📞 Next Steps:</strong>
            <p style="margin: 10px 0 0 0;">Please contact us directly if you have any questions or concerns:</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> +92 301 2345678</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> info@ahmeddental.com</p>
          </div>

          <p>We will confirm your appointment soon. Thank you for choosing Dr. Ahmed Dental Care!</p>

          <p>Best regards,<br><strong>Dr. Ahmed Dental Care Team</strong></p>

          <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
            <p>📍 123 Main Street, Gulshan-e-Iqbal, Karachi</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Pending appointment reminder email sent to:', email);
    return true;
  } catch (error) {
    console.error('Pending reminder email error:', error);
    return false;
  }
};

module.exports = { sendOTPEmail, generateOTP, sendAppointmentApprovalEmail, sendAppointmentCancellationEmail, sendPendingAppointmentReminder };
