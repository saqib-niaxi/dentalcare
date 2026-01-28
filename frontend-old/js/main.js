// Global variables
let currentUser = null;

// Check if user is logged in
checkAuth();

// Check authentication status
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        updateUIForLoggedInUser();
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks || !currentUser) return;

  // Find login link - check both relative and absolute paths
  const loginLink = Array.from(navLinks.children).find(li => {
    const anchor = li.querySelector('a');
    return anchor && (
      anchor.getAttribute('href') === 'pages/login.html' ||
      anchor.getAttribute('href') === 'login.html' ||
      anchor.getAttribute('href')?.includes('login.html')
    );
  });

  if (loginLink) {
    // Determine if we're on homepage or in pages folder
    const isHomepage = window.location.pathname.endsWith('index.html') ||
                       window.location.pathname.endsWith('/') ||
                       !window.location.pathname.includes('/pages/');
    const prefix = isHomepage ? 'pages/' : '';

    if (currentUser.role === 'admin') {
      loginLink.innerHTML = `<a href="${prefix}admin-panel.html">Admin Panel</a>`;
    } else {
      loginLink.innerHTML = `<a href="${prefix}my-appointments.html">My Appointments</a>`;
    }
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time for display
function formatTime(timeString) {
  const [time, period] = timeString.split(' ');
  return `${time} ${period}`;
}

// Get status badge class
function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'approved':
      return 'status-approved';
    case 'cancelled':
      return 'status-cancelled';
    case 'completed':
      return 'status-completed';
    default:
      return '';
  }
}
