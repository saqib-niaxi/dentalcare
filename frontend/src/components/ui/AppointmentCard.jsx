import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatTime } from '../../utils/formatters'
import { PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function AppointmentCard({ appointment, trigger }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // patient field (not user) — populated on create, not on getMyAppointments, so fall back to auth user
  const patientName =
    appointment.patient?.name ||
    appointment.guestInfo?.name ||
    user?.name ||
    'N/A'

  const doctorName = appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'N/A'
  const serviceName = appointment.service?.name || 'General Consultation'
  const date = formatDate(appointment.date)
  const time = formatTime(appointment.time)
  const status = appointment.status
    ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
    : 'N/A'
  const apptId = appointment._id ? appointment._id.slice(-8).toUpperCase() : 'N/A'

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=520,height=680')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appointment Card</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 32px;
          }
          .card {
            width: 100%;
            max-width: 420px;
            border: 2px solid #d4af37;
            border-radius: 16px;
            padding: 32px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #d4af3755;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .clinic-name { font-size: 22px; font-weight: 700; color: #0a0a0a; font-family: Georgia, serif; }
          .clinic-sub { font-size: 13px; color: #888; margin-top: 4px; }
          .gold-dot { width: 40px; height: 4px; background: #d4af37; border-radius: 2px; margin: 8px auto 0; }
          .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
          .row:last-child { border-bottom: none; }
          .label { font-size: 13px; color: #888; font-weight: 500; }
          .value { font-size: 13px; color: #1a1a1a; font-weight: 600; text-align: right; }
          .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #d4af3755; text-align: center; font-size: 12px; color: #888; font-style: italic; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="clinic-name">Dr. Hanif Niazi Dental Clinic</div>
            <div class="clinic-sub">Premium Dental Care</div>
            <div class="gold-dot"></div>
          </div>
          <div class="row"><span class="label">Patient</span><span class="value">${patientName}</span></div>
          <div class="row"><span class="label">Doctor</span><span class="value">${doctorName}</span></div>
          <div class="row"><span class="label">Service</span><span class="value">${serviceName}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${date}</span></div>
          <div class="row"><span class="label">Time</span><span class="value">${time}</span></div>
          <div class="row"><span class="label">Status</span><span class="value">${status}</span></div>
          <div class="row"><span class="label">Appointment ID</span><span class="value">#${apptId}</span></div>
          <div class="footer">Please arrive 10 minutes before your appointment time.</div>
        </div>
        <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <span onClick={() => setIsOpen(true)}>{trigger}</span>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-luxury-gold hover:text-amber-500 border border-luxury-gold/40 hover:border-luxury-gold rounded-lg transition-colors duration-200"
          title="View & print appointment card"
        >
          <PrinterIcon className="w-4 h-4" />
          Print
        </button>
      )}

      {/* Portal overlay — renders at document.body to escape parent transforms */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Card */}
          <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 600, color: '#111' }}>Appointment Card</h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
              >
                <XMarkIcon style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', background: '#fff' }}>
              {/* Inner card preview */}
              <div style={{ border: '2px solid #d4af37', borderRadius: '12px', padding: '20px' }}>
                {/* Clinic header */}
                <div style={{ textAlign: 'center', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f4e4bc' }}>
                  <p style={{ fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#111' }}>Dr. Hanif Niazi Dental Clinic</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>Premium Dental Care</p>
                  <div style={{ width: '40px', height: '4px', background: '#d4af37', borderRadius: '2px', margin: '8px auto 0' }} />
                </div>

                {/* Detail rows */}
                {[
                  { label: 'Patient', value: patientName },
                  { label: 'Doctor', value: doctorName },
                  { label: 'Service', value: serviceName },
                  { label: 'Date', value: date },
                  { label: 'Time', value: time },
                  { label: 'Status', value: status },
                  { label: 'Appointment ID', value: `#${apptId}` },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#888' }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{value}</span>
                  </div>
                ))}

                {/* Footer note */}
                <p style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', fontStyle: 'italic', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f4e4bc' }}>
                  Please arrive 10 minutes before your appointment.
                </p>
              </div>

              {/* Print button */}
              <button
                onClick={handlePrint}
                style={{ marginTop: '16px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: '#1a1a1a', background: 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)' }}
              >
                <PrinterIcon style={{ width: '20px', height: '20px' }} />
                Print Card
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
