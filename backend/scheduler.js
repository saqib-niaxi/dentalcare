const cron = require('node-cron');
const Appointment = require('./models/Appointment');
const { sendPendingAppointmentReminder, sendAppointmentReminderEmail } = require('./utils/email');

// Store sent reminders/actions to avoid duplicates within the same server session
const sentReminders = new Set();

// Check appointments every minute
const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // ── Pending appointments ──────────────────────────────────────────────
      const pendingAppointments = await Appointment.find({ status: 'pending' })
        .populate('patient', 'name email')
        .populate('service', 'name');

      for (const appointment of pendingAppointments) {
        // Support both registered patients and chatbot/guest bookings
        const patientEmail = appointment.patient?.email || appointment.guestInfo?.email;
        const patientName = appointment.patient?.name || appointment.guestInfo?.name || 'Patient';
        const serviceName = appointment.service?.name || appointment.serviceType || 'General Consultation';

        if (!patientEmail) continue;

        const dateStr = new Date(appointment.date).toISOString().split('T')[0];
        const appointmentTime = new Date(`${dateStr}T${appointment.time}:00`);
        const timeUntilMs = appointmentTime - now;
        const minutesUntil = Math.floor(timeUntilMs / (1000 * 60));

        // Send "still pending" warning email 1 hour before
        if (minutesUntil >= 59 && minutesUntil <= 61) {
          const reminderId = `${appointment._id}-1hour`;
          if (!sentReminders.has(reminderId)) {
            try {
              await sendPendingAppointmentReminder(
                patientEmail,
                patientName,
                serviceName,
                appointment.date,
                appointment.time
              );
              sentReminders.add(reminderId);
              console.log(`Sent 1-hour pending reminder for appointment ${appointment._id}`);
            } catch (emailError) {
              console.error(`Failed to send 1-hour reminder for ${appointment._id}:`, emailError);
            }
          }
        }

        // Mark as missed once appointment time has passed (pending = never approved)
        if (minutesUntil <= 0) {
          const missedId = `${appointment._id}-missed`;
          if (!sentReminders.has(missedId)) {
            try {
              await Appointment.findByIdAndUpdate(appointment._id, { status: 'missed' });
              sentReminders.add(missedId);
              console.log(`Marked appointment ${appointment._id} as missed (was never approved)`);
            } catch (err) {
              console.error(`Error marking appointment ${appointment._id} as missed:`, err);
            }
          }
        }
      }

      // ── Approved appointments — 24-hour reminder ──────────────────────────
      const approvedAppointments = await Appointment.find({ status: 'approved' })
        .populate('patient', 'name email')
        .populate('service', 'name');

      for (const appointment of approvedAppointments) {
        const patientEmail = appointment.patient?.email || appointment.guestInfo?.email;
        const patientName = appointment.patient?.name || appointment.guestInfo?.name || 'Patient';
        const serviceName = appointment.service?.name || appointment.serviceType || 'General Consultation';

        if (!patientEmail) continue;

        const dateStr2 = new Date(appointment.date).toISOString().split('T')[0];
        const appointmentTime2 = new Date(`${dateStr2}T${appointment.time}:00`);
        const minutesUntil2 = Math.floor((appointmentTime2 - now) / (1000 * 60));

        // Send 24-hour reminder (23–25 hour window to avoid missing it)
        if (minutesUntil2 >= 1380 && minutesUntil2 <= 1500) {
          const reminderId = `${appointment._id}-24hour`;
          if (!sentReminders.has(reminderId)) {
            try {
              await sendAppointmentReminderEmail(
                patientEmail,
                patientName,
                serviceName,
                appointment.date,
                appointment.time
              );
              sentReminders.add(reminderId);
              console.log(`Sent 24-hour reminder for appointment ${appointment._id}`);
            } catch (emailError) {
              console.error(`Failed to send 24-hour reminder for ${appointment._id}:`, emailError);
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
