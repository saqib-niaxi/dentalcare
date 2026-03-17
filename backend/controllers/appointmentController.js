const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { sendAppointmentApprovalEmail, sendAppointmentCancellationEmail } = require('../utils/email');

// @desc    Create new appointment (requires login)
exports.createAppointment = async (req, res) => {
  try {
    const { service, doctor, date, time, notes } = req.body;

    // Use logged-in user as patient
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate doctor exists and is active
    const selectedDoctor = await Doctor.findById(doctor).populate('services');
    if (!selectedDoctor || !selectedDoctor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected doctor is not available'
      });
    }

    // Check if doctor provides the selected service
    if (service) {
      const providesService = selectedDoctor.services.some(
        s => s._id.toString() === service.toString()
      );
      if (!providesService) {
        return res.status(400).json({
          success: false,
          message: 'This doctor does not provide the selected service'
        });
      }
    }

    // Validate date and time
    const appointmentDate = new Date(date);
    const dayOfWeekNum = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dayOfWeekNum];

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

    // Check if doctor works on this day
    const daySchedule = selectedDoctor.workingDays[dayOfWeek];
    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${selectedDoctor.name} does not work on ${dayOfWeek}s. Please select another day.`
      });
    }

    // Parse time (format: HH:mm)
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    // Parse doctor's schedule
    const [startHours, startMinutes] = daySchedule.start.split(':').map(Number);
    const startTime = startHours * 60 + startMinutes;
    const [endHours, endMinutes] = daySchedule.end.split(':').map(Number);
    const endTime = endHours * 60 + endMinutes;

    // Check if time is within doctor's working hours
    if (timeInMinutes < startTime || timeInMinutes >= endTime) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${selectedDoctor.name} works from ${daySchedule.start} to ${daySchedule.end} on ${dayOfWeek}s`
      });
    }

    // Check if time is during break
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      const [breakStartHours, breakStartMinutes] = daySchedule.breakStart.split(':').map(Number);
      const breakStart = breakStartHours * 60 + breakStartMinutes;
      const [breakEndHours, breakEndMinutes] = daySchedule.breakEnd.split(':').map(Number);
      const breakEnd = breakEndHours * 60 + breakEndMinutes;

      if (timeInMinutes >= breakStart && timeInMinutes < breakEnd) {
        return res.status(400).json({
          success: false,
          message: `This time is during Dr. ${selectedDoctor.name}'s break (${daySchedule.breakStart} - ${daySchedule.breakEnd})`
        });
      }
    }

    // Check if time slot is already booked for this doctor (excluding cancelled appointments)
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const existingAppointment = await Appointment.findOne({
      doctor: doctor,
      date: { $gte: new Date(`${dateStr}T00:00:00`), $lt: new Date(`${dateStr}T23:59:59`) },
      time: time,
      status: { $ne: 'cancelled' } // Exclude cancelled appointments
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${selectedDoctor.name} already has an appointment at this time. Please select another time.`
      });
    }

    const appointment = new Appointment({
      patient: patient._id,
      service,
      doctor,
      date,
      time,
      notes,
      status: 'pending'
    });

    await appointment.save();

    // Populate appointment with full details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('service', 'name price duration')
      .populate('doctor', 'name specialization');

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
      .populate('doctor', 'name specialization')
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
      .populate('doctor', 'name specialization photo')
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

// @desc    Get all patients (registered + unregistered from appointments)
// @route   GET /api/appointments/all-patients
exports.getAllPatients = async (req, res) => {
  try {
    // Get registered users
    const registeredUsers = await User.find({ role: 'patient' })
      .select('name email phone createdAt')
      .lean();

    const registeredPatients = registeredUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      isRegistered: true,
      source: 'registered'
    }));

    // Get unique unregistered patients from appointments (guestInfo)
    const appointments = await Appointment.find({
      patient: null, // No registered patient linked
      'guestInfo.name': { $exists: true }
    }).lean();

    // Create unique list of unregistered patients
    const unregisteredMap = new Map();

    appointments.forEach(apt => {
      const email = apt.guestInfo?.email;
      const phone = apt.guestInfo?.phone;
      const key = email || phone; // Use email or phone as unique identifier

      if (key && !unregisteredMap.has(key)) {
        unregisteredMap.set(key, {
          _id: `guest-${key}`, // Fake ID for frontend
          name: apt.guestInfo?.name || 'Guest Patient',
          email: apt.guestInfo?.email || null,
          phone: apt.guestInfo?.phone || null,
          createdAt: apt.createdAt, // First appointment date
          isRegistered: false,
          source: apt.source || 'chatbot'
        });
      }
    });

    const unregisteredPatients = Array.from(unregisteredMap.values());

    // Combine both lists
    const allPatients = [...registeredPatients, ...unregisteredPatients];

    res.json({
      success: true,
      patients: allPatients,
      stats: {
        total: allPatients.length,
        registered: registeredPatients.length,
        unregistered: unregisteredPatients.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reschedule appointment (patient only, pending only)
// @route   PUT /api/appointments/:id/reschedule
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { service, doctor, date, time } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending appointments can be rescheduled' });
    }

    // Validate doctor
    const selectedDoctor = await Doctor.findById(doctor).populate('services');
    if (!selectedDoctor || !selectedDoctor.isActive) {
      return res.status(400).json({ success: false, message: 'Selected doctor is not available' });
    }

    if (service) {
      const providesService = selectedDoctor.services.some(s => s._id.toString() === service.toString());
      if (!providesService) {
        return res.status(400).json({ success: false, message: 'This doctor does not provide the selected service' });
      }
    }

    // Validate date
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDateOnly = new Date(appointmentDate);
    appointmentDateOnly.setHours(0, 0, 0, 0);

    if (appointmentDateOnly < tomorrow) {
      return res.status(400).json({ success: false, message: 'Appointments can only be booked from tomorrow onwards.' });
    }

    // Validate working day
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[appointmentDate.getDay()];
    const daySchedule = selectedDoctor.workingDays[dayOfWeek];
    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(400).json({ success: false, message: `Dr. ${selectedDoctor.name} does not work on ${dayOfWeek}s.` });
    }

    // Validate time
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const [startH, startM] = daySchedule.start.split(':').map(Number);
    const [endH, endM] = daySchedule.end.split(':').map(Number);
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (timeInMinutes < startTime || timeInMinutes >= endTime) {
      return res.status(400).json({ success: false, message: `Dr. ${selectedDoctor.name} works from ${daySchedule.start} to ${daySchedule.end} on ${dayOfWeek}s` });
    }

    if (daySchedule.breakStart && daySchedule.breakEnd) {
      const [bsH, bsM] = daySchedule.breakStart.split(':').map(Number);
      const [beH, beM] = daySchedule.breakEnd.split(':').map(Number);
      const breakStart = bsH * 60 + bsM;
      const breakEnd = beH * 60 + beM;
      if (timeInMinutes >= breakStart && timeInMinutes < breakEnd) {
        return res.status(400).json({ success: false, message: `This time is during Dr. ${selectedDoctor.name}'s break (${daySchedule.breakStart} - ${daySchedule.breakEnd})` });
      }
    }

    // Conflict check (exclude self)
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: doctor,
      date: { $gte: new Date(`${dateStr}T00:00:00`), $lt: new Date(`${dateStr}T23:59:59`) },
      time: time,
      status: { $ne: 'cancelled' }
    });

    if (conflict) {
      return res.status(400).json({ success: false, message: `Dr. ${selectedDoctor.name} already has an appointment at this time.` });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.doctor = doctor;
    appointment.service = service;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('service', 'name price duration')
      .populate('doctor', 'name specialization');

    res.json({ success: true, message: 'Appointment rescheduled successfully', appointment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
