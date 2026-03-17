import { useState } from 'react'
import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'

export default function PatientsTab({ patients }) {
  const [filter, setFilter] = useState('all')

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

  const registeredCount = patients.filter(p => p.isRegistered).length
  const unregisteredCount = patients.filter(p => !p.isRegistered).length

  // Filter patients based on selected filter
  const filteredPatients = patients.filter(patient => {
    if (filter === 'all') return true
    if (filter === 'registered') return patient.isRegistered
    if (filter === 'unregistered') return !patient.isRegistered
    return true
  })

  const filters = [
    { id: 'all', label: 'All Patients', count: patients.length },
    { id: 'registered', label: 'Registered', count: registeredCount },
    { id: 'unregistered', label: 'Unregistered', count: unregisteredCount }
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">All Patients</h2>
          <p className="text-slate-400 text-sm mt-1">Registered users and guests who booked appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <UserGroupIcon className="w-5 h-5" />
            <span className="font-medium">{patients.length} Total</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              filter === f.id
                ? f.id === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : f.id === 'registered'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f.id === 'registered' && <ShieldCheckIcon className="w-4 h-4" />}
            {f.id === 'unregistered' && <ShieldExclamationIcon className="w-4 h-4" />}
            {f.id === 'all' && <UserGroupIcon className="w-4 h-4" />}
            {f.label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              filter === f.id
                ? f.id === 'all'
                  ? 'bg-cyan-500/30'
                  : f.id === 'registered'
                  ? 'bg-emerald-500/30'
                  : 'bg-amber-500/30'
                : 'bg-white/10'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-16">
          <UserGroupIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            {filter === 'all' ? 'No patients found' : `No ${filter} patients`}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'all'
              ? 'Patients will appear here when they book appointments'
              : `Try selecting a different filter to view other patients`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.map((patient, index) => (
            <div
              key={patient._id}
              className="bg-slate-700/30 hover:bg-slate-700/50 rounded-2xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              {/* Patient Avatar & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${getRandomGradient(index)} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                  {patient.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors truncate">
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {patient.isRegistered ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                        <ShieldCheckIcon className="w-3 h-3" />
                        Registered
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                        <ShieldExclamationIcon className="w-3 h-3" />
                        Unregistered
                      </span>
                    )}
                    {patient.source === 'chatbot' || patient.source === 'chatbot-ai' ? (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                        Chatbot
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {patient.email && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center shrink-0">
                      <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm truncate">{patient.email}</span>
                  </div>
                )}

                {patient.phone && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center shrink-0">
                      <PhoneIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                )}

                {!patient.email && !patient.phone && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center shrink-0">
                      <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm italic">No contact info</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm">
                    {patient.isRegistered ? 'Joined' : 'First appointment'}{' '}
                    {patient.createdAt
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

              {/* Account Creation Prompt for Unregistered */}
              {!patient.isRegistered && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    💡 This patient needs to create an account to access their appointments and history.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
