const cron = require('node-cron');
const Appointment = require('./models/Appointment');
const { sendPendingAppointmentReminder, sendAppointmentCancellationEmail } = require('./utils/email');

// Store sent reminders to avoid duplicates
const sentReminders = new Set();

// Check appointments every minute
const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find all pending appointments
      const pendingAppointments = await Appointment.find({ status: 'pending' })
        .populate('patient', 'name email')
        .populate('service', 'name');

      for (const appointment of pendingAppointments) {
        if (!appointment.patient || !appointment.service) continue;

        // Parse date and time properly
        const dateStr = new Date(appointment.date).toISOString().split('T')[0];
        const appointmentTime = new Date(`${dateStr}T${appointment.time}:00`);
        const timeUntilAppointment = appointmentTime - now;
        const minutesUntil = Math.floor(timeUntilAppointment / (1000 * 60));

        // Issue 2: Send reminder 1 hour (60 minutes) before appointment
        if (minutesUntil >= 59 && minutesUntil <= 61) {
          const reminderId = `${appointment._id}-1hour`;
          if (!sentReminders.has(reminderId)) {
            try {
              await sendPendingAppointmentReminder(
                appointment.patient.email,
                appointment.patient.name,
                appointment.service.name,
                appointment.date,
                appointment.time
              );
              sentReminders.add(reminderId);
              console.log(`Sent 1-hour reminder for appointment ${appointment._id}`);
            } catch (emailError) {
              console.error(`Failed to send reminder for appointment ${appointment._id}:`, emailError);
            }
          }
        }

        // Issue 3: Auto-cancel 15 minutes before appointment if still pending
        if (minutesUntil >= 14 && minutesUntil <= 16) {
          const cancelId = `${appointment._id}-autocancelled`;
          if (!sentReminders.has(cancelId)) {
            try {
              await Appointment.findByIdAndUpdate(
                appointment._id,
                { status: 'cancelled' }
              );

              await sendAppointmentCancellationEmail(
                appointment.patient.email,
                appointment.patient.name,
                appointment.service.name,
                appointment.date,
                appointment.time
              );

              sentReminders.add(cancelId);
              console.log(`Auto-cancelled appointment ${appointment._id} - doctor did not approve`);
            } catch (error) {
              console.error(`Error auto-cancelling appointment ${appointment._id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });

  console.log('Appointment scheduler started');
};

module.exports = { startScheduler };
