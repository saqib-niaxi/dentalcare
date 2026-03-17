const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Get all active doctors (PUBLIC)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate('services', 'name price duration')
      .select('-__v')
      .sort({ rating: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
};

// Get single doctor by ID (PUBLIC)
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id)
      .populate('services', 'name price duration description');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
};

// Get doctors by service (PUBLIC)
exports.getDoctorsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const doctors = await Doctor.find({
      services: serviceId,
      isActive: true
    })
      .populate('services', 'name price duration')
      .select('-__v')
      .sort({ rating: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Error fetching doctors by service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors for this service',
      error: error.message
    });
  }
};

// Get doctor's available time slots for a specific date (PUBLIC)
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not active'
      });
    }

    // Get day of week
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Check if doctor works on this day
    const daySchedule = doctor.workingDays[dayOfWeek];
    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(200).json({
        success: true,
        slots: [],
        message: `Doctor does not work on ${dayOfWeek}s`
      });
    }

    // Get existing appointments for this doctor on this date
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const existingAppointments = await Appointment.find({
      doctor: id,
      date: {
        $gte: new Date(`${dateStr}T00:00:00`),
        $lt: new Date(`${dateStr}T23:59:59`)
      },
      status: { $ne: 'cancelled' }
    }).select('time');

    const bookedTimes = existingAppointments.map(apt => apt.time);

    // Generate available slots based on doctor's schedule
    const slots = [];
    const startTime = daySchedule.start;
    const endTime = daySchedule.end;
    const breakStart = daySchedule.breakStart;
    const breakEnd = daySchedule.breakEnd;

    // Helper function to convert time string to minutes
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Helper function to convert minutes to time string
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const slotDuration = 30; // 30-minute slots

    for (let time = startMinutes; time < endMinutes; time += slotDuration) {
      const timeSlot = minutesToTime(time);

      // Skip if in break time
      if (breakStart && breakEnd) {
        const breakStartMinutes = timeToMinutes(breakStart);
        const breakEndMinutes = timeToMinutes(breakEnd);
        if (time >= breakStartMinutes && time < breakEndMinutes) {
          continue;
        }
      }

      // Skip if already booked
      if (!bookedTimes.includes(timeSlot)) {
        slots.push(timeSlot);
      }
    }

    res.status(200).json({
      success: true,
      date: dateStr,
      dayOfWeek,
      slots
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability',
      error: error.message
    });
  }
};

// Create new doctor (ADMIN)
exports.createDoctor = async (req, res) => {
  try {
    const doctorData = req.body;

    // Check if email already exists
    const existingDoctor = await Doctor.findOne({ email: doctorData.email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'A doctor with this email already exists'
      });
    }

    const doctor = await Doctor.create(doctorData);
    await doctor.populate('services', 'name price duration');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
      error: error.message
    });
  }
};

// Update doctor (ADMIN)
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if email is being changed and if it's unique
    if (updateData.email) {
      const existingDoctor = await Doctor.findOne({
        email: updateData.email,
        _id: { $ne: id }
      });

      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: 'A doctor with this email already exists'
        });
      }
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('services', 'name price duration');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: error.message
    });
  }
};

// Delete doctor (soft delete - ADMIN)
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deactivated successfully',
      doctor
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
};

// Get all doctors including inactive (ADMIN)
exports.getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('services', 'name price duration')
      .select('-__v')
      .sort({ isActive: -1, rating: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
};
