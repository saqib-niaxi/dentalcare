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
      try {
        await sendAppointmentApprovalEmail(
          appointment.patient.email,
          appointment.patient.name,
          appointment.service?.name || 'General Consultation',
          appointment.date,
          appointment.time,
          appointment.service?.price || 0
        );
      } catch (emailError) {
        console.error('Approval email failed:', emailError);
        // Don't fail the status update if email fails
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
    try {
      await sendAppointmentCancellationEmail(
        appointment.patient.email,
        appointment.patient.name,
        appointment.service?.name || 'General Consultation',
        appointment.date,
        appointment.time
      );
    } catch (emailError) {
      console.error('Cancellation email failed:', emailError);
      // Don't fail the deletion if email fails
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
