import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export default function PatientsTab({ patients }) {
  const getRandomGradient = (index) => {
    const gradients = [
      'from-amber-400 to-amber-600',
      'from-emerald-400 to-emerald-600',
      'from-blue-400 to-blue-600',
      'from-violet-400 to-violet-600',
      'from-pink-400 to-pink-600',
      'from-cyan-400 to-cyan-600'
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Patients</h2>
          <p className="text-slate-400 text-sm mt-1">All registered patients in the system</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
          <UserGroupIcon className="w-5 h-5" />
          <span className="font-medium">{patients.length} Total Patients</span>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-16">
          <UserGroupIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No patients found</p>
          <p className="text-slate-500 text-sm mt-1">Patients will appear here when they book appointments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map((patient, index) => (
            <div
              key={patient._id}
              className="bg-slate-700/30 hover:bg-slate-700/50 rounded-2xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              {/* Patient Avatar & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${getRandomGradient(index)} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                  {patient.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-slate-500 text-sm">Patient</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm truncate">{patient.email}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm">{patient.phone || 'No phone'}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm">
                    Joined {patient.createdAt
                      ? new Date(patient.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                    Active Patient
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
