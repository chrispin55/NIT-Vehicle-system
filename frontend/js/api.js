// API Service for NIT ITVMS
class ApiService {
  constructor() {
    this.baseURL = '/api';
    this.token = null;
    this.user = null;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.success) {
      this.token = data.data.token;
      this.user = data.data.user;
    }
    
    return data;
  }

  async logout() {
    this.token = null;
    this.user = null;
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  // Get current user info
  getCurrentUser() {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Vehicle methods
  async getVehicles() {
    return await this.request('/vehicles');
  }

  async getVehicle(id) {
    return await this.request(`/vehicles/${id}`);
  }

  async createVehicle(vehicleData) {
    return await this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  }

  async updateVehicle(id, vehicleData) {
    return await this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    });
  }

  async deleteVehicle(id) {
    return await this.request(`/vehicles/${id}`, {
      method: 'DELETE'
    });
  }

  async getVehicleStats() {
    return await this.request('/vehicles/stats/summary');
  }

  async getAvailableVehicles() {
    return await this.request('/vehicles/available/list');
  }

  // Driver methods
  async getDrivers() {
    return await this.request('/drivers');
  }

  async getDriver(id) {
    return await this.request(`/drivers/${id}`);
  }

  async createDriver(driverData) {
    return await this.request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  }

  async updateDriver(id, driverData) {
    return await this.request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  }

  async deleteDriver(id) {
    return await this.request(`/drivers/${id}`, {
      method: 'DELETE'
    });
  }

  async getActiveDrivers() {
    return await this.request('/drivers/active/list');
  }

  async assignVehicleToDriver(driverId, vehicleId) {
    return await this.request(`/drivers/${driverId}/assign-vehicle`, {
      method: 'PUT',
      body: JSON.stringify({ vehicle_id: vehicleId })
    });
  }

  async unassignVehicleFromDriver(driverId) {
    return await this.request(`/drivers/${driverId}/unassign-vehicle`, {
      method: 'PUT'
    });
  }

  async getDriverStats() {
    return await this.request('/drivers/stats/summary');
  }

  // Trip methods
  async getTrips() {
    return await this.request('/trips');
  }

  async getTrip(id) {
    return await this.request(`/trips/${id}`);
  }

  async createTrip(tripData) {
    return await this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  async updateTrip(id, tripData) {
    return await this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData)
    });
  }

  async deleteTrip(id) {
    return await this.request(`/trips/${id}`, {
      method: 'DELETE'
    });
  }

  async updateTripStatus(id, status) {
    return await this.request(`/trips/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getTodayTrips() {
    return await this.request('/trips/today/list');
  }

  async getUpcomingTrips() {
    return await this.request('/trips/upcoming/list');
  }

  async getRecentTrips() {
    return await this.request('/trips/recent/list');
  }

  async getTripStats() {
    return await this.request('/trips/stats/summary');
  }

  // Maintenance methods
  async getMaintenanceRecords() {
    return await this.request('/maintenance');
  }

  async getMaintenanceRecord(id) {
    return await this.request(`/maintenance/${id}`);
  }

  async createMaintenanceRecord(maintenanceData) {
    return await this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceData)
    });
  }

  async updateMaintenanceRecord(id, maintenanceData) {
    return await this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(maintenanceData)
    });
  }

  async deleteMaintenanceRecord(id) {
    return await this.request(`/maintenance/${id}`, {
      method: 'DELETE'
    });
  }

  async getVehicleMaintenance(vehicleId) {
    return await this.request(`/maintenance/vehicle/${vehicleId}`);
  }

  async getUpcomingServices() {
    return await this.request('/maintenance/upcoming/list');
  }

  async getOverdueServices() {
    return await this.request('/maintenance/overdue/list');
  }

  async getMonthlyMaintenanceCosts(year, month) {
    const params = new URLSearchParams({ year });
    if (month) params.append('month', month);
    return await this.request(`/maintenance/costs/monthly?${params}`);
  }

  async getMaintenanceStats() {
    return await this.request('/maintenance/stats/summary');
  }

  // Reports methods
  async getDashboardData() {
    return await this.request('/reports/dashboard');
  }

  async getFuelConsumptionReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/reports/fuel-consumption?${queryString}`);
  }

  async getTripSummaryReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/reports/trip-summary?${queryString}`);
  }

  async getVehicleUtilizationReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/reports/vehicle-utilization?${queryString}`);
  }
}

// Create global API instance
const api = new ApiService();

// Utility functions
function showLoading(element) {
  if (element) {
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
  }
}

function hideLoading(element, originalText) {
  if (element) {
    element.disabled = false;
    element.innerHTML = originalText;
  }
}

function showAlert(message, type = 'info') {
  // Create alert container if it doesn't exist
  let alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alertContainer';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '9999';
    document.body.appendChild(alertContainer);
  }

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  alertContainer.appendChild(alertDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

function formatCurrency(amount, currency = 'TZS') {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-TZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateString, timeString) {
  const date = new Date(dateString);
  if (timeString) {
    const [hours, minutes] = timeString.split(':');
    date.setHours(hours, minutes);
  }
  return date.toLocaleString('en-TZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Export for use in other files
window.api = api;
window.showAlert = showAlert;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
