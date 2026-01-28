export default function PatientsTab({ patients }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-dark">Registered Patients</h2>
        <span className="text-gray-500">{patients.length} patients</span>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No patients found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-light">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {patient.email}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {patient.phone || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {patient.createdAt
                      ? new Date(patient.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
