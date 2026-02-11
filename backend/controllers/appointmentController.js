const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { sendAppointmentApprovalEmail, sendAppointmentCancellationEmail } = require('../utils/email');

// @desc    Create new appointment (requires login)
exports.createAppointment = async (req, res) => {
  try {
    const { service, date, time, notes } = req.body;

    // Use logged-in user as patient
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate date and time
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Check if Sunday (clinic is closed)
    if (dayOfWeek === 0) {
      return res.status(400).json({
        success: false,
        message: 'Clinic is closed on Sundays. Please select another day.'
      });
    }

    // Check if appointment is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDateOnly = new Date(appointmentDate);
    appointmentDateOnly.setHours(0, 0, 0, 0);

    // Allow booking only from tomorrow onwards
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (appointmentDateOnly < tomorrow) {
      return res.status(400).json({
        success: false,
        message: 'Appointments can only be booked from tomorrow onwards. Please select a future date.'
      });
    }

    // Parse time (format: HH:mm)
    const [hours, minutes] = time.split(':').map(Number);

    // Check time based on day
    let isValidTime = false;
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Monday to Friday: 9:00 AM - 6:00 PM (09:00 - 18:00)
      isValidTime = (hours >= 9 && hours < 18) || (hours === 18 && minutes === 0);
    } else if (dayOfWeek === 6) {
      // Saturday: 9:00 AM - 2:00 PM (09:00 - 14:00)
      isValidTime = (hours >= 9 && hours < 14) || (hours === 14 && minutes === 0);
    }

    if (!isValidTime) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      let availableHours = '';
      if (dayOfWeek === 0) {
        availableHours = 'clinic is closed';
      } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        availableHours = '9:00 AM - 6:00 PM';
      } else if (dayOfWeek === 6) {
        availableHours = '9:00 AM - 2:00 PM';
      }
      return res.status(400).json({
        success: false,
        message: `Invalid time slot. ${dayName} clinic hours: ${availableHours}`
      });
    }

    // Check if time slot is already booked (excluding cancelled appointments)
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const existingAppointment = await Appointment.findOne({
      date: { $gte: new Date(`${dateStr}T00:00:00`), $lt: new Date(`${dateStr}T23:59:59`) },
      time: time,
      status: { $ne: 'cancelled' } // Exclude cancelled appointments
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: `This time slot is already booked. Please select another time.`
      });
    }

    const appointment = new Appointment({
      patient: patient._id,
      service,
      date,
      time,
      notes,
      status: 'pending'
    });

    await appointment.save();

    // Populate appointment with full details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('service', 'name price duration');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all appointments (for admin)
// @route   GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('service', 'name price')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's appointments
// @route   GET /api/appointments/my-appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('service', 'name price duration')
      .sort({ date: -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('service', 'name price duration');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const previousStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    // Send approval email if status changed to approved
    if (status === 'approved' && previousStatus !== 'approved') {
      // Get email and name from either registered patient or guest info (chatbot booking)
      const patientEmail = appointment.patient?.email || appointment.guestInfo?.email;
      const patientName = appointment.patient?.name || appointment.guestInfo?.name || 'Patient';
      const serviceName = appointment.service?.name || appointment.serviceType || 'General Consultation';
      const servicePrice = appointment.service?.price || 0;

      if (patientEmail) {
        try {
          await sendAppointmentApprovalEmail(
            patientEmail,
            patientName,
            serviceName,
            appointment.date,
            appointment.time,
            servicePrice
          );
          console.log('Approval email sent to:', patientEmail);
        } catch (emailError) {
          console.error('Approval email failed:', emailError);
          // Don't fail the status update if email fails
        }
      } else {
        console.log('No email available for appointment:', appointment._id);
      }
    }

    // Send cancellation email if status changed to cancelled
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      const patientEmail = appointment.patient?.email || appointment.guestInfo?.email;
      const patientName = appointment.patient?.name || appointment.guestInfo?.name || 'Patient';
      const serviceName = appointment.service?.name || appointment.serviceType || 'General Consultation';

      if (patientEmail) {
        try {
          await sendAppointmentCancellationEmail(
            patientEmail,
            patientName,
            serviceName,
            appointment.date,
            appointment.time
          );
          console.log('Cancellation email sent to:', patientEmail);
        } catch (emailError) {
          console.error('Cancellation email failed:', emailError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Appointment status updated',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('service', 'name price');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Send cancellation email to patient before deleting
    const patientEmail = appointment.patient?.email || appointment.guestInfo?.email;
    const patientName = appointment.patient?.name || appointment.guestInfo?.name || 'Patient';
    const serviceName = appointment.service?.name || appointment.serviceType || 'General Consultation';

    if (patientEmail) {
      try {
        await sendAppointmentCancellationEmail(
          patientEmail,
          patientName,
          serviceName,
          appointment.date,
          appointment.time
        );
        console.log('Cancellation email sent to:', patientEmail);
      } catch (emailError) {
        console.error('Cancellation email failed:', emailError);
        // Don't fail the deletion if email fails
      }
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted and patient notified'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
