let appointments = [];

// Check if admin is logged in
checkAdminAuth();

async function checkAdminAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user.role !== 'admin') {
        window.location.href = '../index.html';
      }
      document.getElementById('adminName').textContent = data.user.name;
      loadAllAppointments();
      loadServicesAdmin();
      loadPatientsAdmin();
    } else {
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Admin auth check failed:', error);
    window.location.href = 'login.html';
  }
}

function showSection(sectionName, button = null) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  document.getElementById(sectionName).classList.add('active');

  // Update nav buttons
  document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.classList.remove('active');
  });

  if (button) {
    button.classList.add('active');
  } else {
    // Find button by onclick or text
    const buttons = document.querySelectorAll('.admin-nav button');
    for (let btn of buttons) {
      if (btn.onclick && btn.onclick.toString().includes(sectionName)) {
        btn.classList.add('active');
        break;
      }
    }
  }
}

async function loadAllAppointments() {
  try {
    const response = await fetch('/api/appointments', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      appointments = data.appointments;
      displayAppointments(appointments);
      updateStats(appointments);
    }
  } catch (error) {
    console.error('Failed to load appointments:', error);
    document.getElementById('appointmentsTableBody').innerHTML =
      '<tr><td colspan="7" style="text-align: center;">Failed to load appointments</td></tr>';
  }
}

function updateStats(appointments) {
  document.getElementById('totalAppointments').textContent = appointments.length;
  document.getElementById('pendingAppointments').textContent = appointments.filter(a => a.status === 'pending').length;
  document.getElementById('approvedAppointments').textContent = appointments.filter(a => a.status === 'approved').length;
  document.getElementById('completedAppointments').textContent = appointments.filter(a => a.status === 'completed').length;
}

function displayAppointments(appointments) {
  const tbody = document.getElementById('appointmentsTableBody');

  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No appointments found</td></tr>';
    return;
  }

  tbody.innerHTML = appointments.map(appointment => `
    <tr>
      <td>${appointment.patient?.name || 'N/A'}</td>
      <td>${appointment.service?.name || 'N/A'}</td>
      <td>${formatDate(appointment.date)}</td>
      <td>${appointment.time}</td>
      <td>${appointment.patient?.phone || 'N/A'}</td>
      <td>
        <span class="status-${appointment.status}">
          ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </td>
      <td>
        ${appointment.status === 'pending' ?
          `<button class="action-btn" onclick="updateStatus('${appointment._id}', 'approved')">Approve</button>` :
          ''
        }
        ${appointment.status === 'approved' ?
          `<button class="action-btn" onclick="updateStatus('${appointment._id}', 'completed')">Complete</button>` :
          ''
        }
        <button class="action-btn danger" onclick="deleteAppointment('${appointment._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function updateStatus(appointmentId, status) {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      showAlert(`Appointment ${status} successfully`, 'success');
      loadAllAppointments();
    } else {
      const data = await response.json().catch(() => ({}));
      showAlert(data.message || 'Failed to update status', 'error');
    }
  } catch (error) {
    showAlert('Failed to update status', 'error');
  }
}

async function deleteAppointment(appointmentId) {
  if (!confirm('Are you sure you want to delete this appointment?')) {
    return;
  }

  try {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      showAlert('Appointment deleted successfully', 'success');
      loadAllAppointments();
    } else {
      const data = await response.json().catch(() => ({}));
      showAlert(data.message || 'Failed to delete appointment', 'error');
    }
  } catch (error) {
    showAlert('Failed to delete appointment', 'error');
  }
}

async function loadServicesAdmin() {
  try {
    const response = await fetch('/api/services');
    if (response.ok) {
      const data = await response.json();
      displayServicesAdmin(data.services);
    }
  } catch (error) {
    console.error('Failed to load services:', error);
    document.getElementById('servicesListAdmin').innerHTML = '<p>Failed to load services</p>';
  }
}

function displayServicesAdmin(services) {
  const container = document.getElementById('servicesListAdmin');

  if (services.length === 0) {
    container.innerHTML = '<p>No services available</p>';
    return;
  }

  container.innerHTML = `
    <table class="appointments-table">
      <thead>
        <tr>
          <th>Service Name</th>
          <th>Price</th>
          <th>Duration</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${services.map(service => `
          <tr>
            <td>${service.name}</td>
            <td>PKR ${service.price.toLocaleString()}</td>
            <td>${service.duration}</td>
            <td>
              <button class="action-btn" onclick="editService('${service._id}', '${service.name}', '${service.description.replace(/'/g, "\\'")}', ${service.price}, '${service.duration}')">Edit</button>
              <button class="action-btn danger" onclick="deleteService('${service._id}')">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function deleteService(serviceId) {
  if (!confirm('Are you sure you want to delete this service?')) {
    return;
  }

  try {
    const response = await fetch(`/api/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      showAlert('Service deleted successfully', 'success');
      loadServicesAdmin();
    } else {
      const data = await response.json().catch(() => ({}));
      showAlert(data.message || 'Failed to delete service', 'error');
    }
  } catch (error) {
    showAlert('Failed to delete service', 'error');
  }
}

function editService(serviceId, name, description, price, duration) {
  document.getElementById('serviceName').value = name;
  document.getElementById('serviceDescription').value = description;
  document.getElementById('servicePrice').value = price;
  document.getElementById('serviceDuration').value = duration;

  // Add hidden input for service ID and change form to update
  const form = document.getElementById('addServiceForm');
  let serviceIdInput = form.querySelector('input[name="serviceId"]');
  if (!serviceIdInput) {
    serviceIdInput = document.createElement('input');
    serviceIdInput.type = 'hidden';
    serviceIdInput.name = 'serviceId';
    form.appendChild(serviceIdInput);
  }
  serviceIdInput.value = serviceId;

  document.querySelector('#addServiceForm button[type="submit"]').textContent = 'Update Service';
  showSection('addService');
}

async function loadPatientsAdmin() {
  try {
    const response = await fetch('/api/auth/patients', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      displayPatientsAdmin(data.patients);
    }
  } catch (error) {
    console.error('Failed to load patients:', error);
    document.getElementById('patientsListAdmin').innerHTML = '<p>Failed to load patients</p>';
  }
}

function displayPatientsAdmin(patients) {
  const container = document.getElementById('patientsListAdmin');

  if (patients.length === 0) {
    container.innerHTML = '<p>No patients found</p>';
    return;
  }

  container.innerHTML = `
    <table class="appointments-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Registered Date</th>
        </tr>
      </thead>
      <tbody>
        ${patients.map(patient => `
          <tr>
            <td>${patient.name}</td>
            <td>${patient.email}</td>
            <td>${patient.phone}</td>
            <td>${formatDate(patient.createdAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Add Service Form Handler (now handles both add and update)
document.getElementById('addServiceForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const serviceIdInput = document.querySelector('#addServiceForm input[name="serviceId"]');
  const isUpdate = serviceIdInput && serviceIdInput.value;

  const serviceData = {
    name: document.getElementById('serviceName').value,
    description: document.getElementById('serviceDescription').value,
    price: parseInt(document.getElementById('servicePrice').value),
    duration: document.getElementById('serviceDuration').value
  };

  const url = isUpdate ? `/api/services/${serviceIdInput.value}` : '/api/services';
  const method = isUpdate ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(serviceData)
    });

    const messageDiv = document.getElementById('addServiceMessage');

    if (response.ok) {
      const action = isUpdate ? 'updated' : 'added';
      messageDiv.innerHTML = `<div class="alert alert-success">Service ${action} successfully!</div>`;
      document.getElementById('addServiceForm').reset();

      // Remove hidden input and reset button text
      if (serviceIdInput) {
        serviceIdInput.remove();
      }
      document.querySelector('#addServiceForm button[type="submit"]').textContent = 'Add Service';

      loadServicesAdmin();
      showSection('services');
    } else {
      const data = await response.json().catch(() => ({}));
      messageDiv.innerHTML = `<div class="alert alert-error">${data.message || 'Failed to save service'}</div>`;
    }

    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 5000);
  } catch (error) {
    const messageDiv = document.getElementById('addServiceMessage');
    messageDiv.innerHTML = '<div class="alert alert-error">Network error. Please try again.</div>';
    console.error('Service save error:', error);
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../index.html';
}
