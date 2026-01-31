// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

console.log('🔗 API Configuration:');
console.log('Hostname:', window.location.hostname);
console.log('API Base URL:', API_BASE_URL);

// API helper functions
class API {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('authToken');
        console.log('🔑 API initialized with base URL:', this.baseURL);
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            console.log(`📡 Response status: ${response.status} for ${url}`);
            
            const data = await response.json();
            console.log(`📦 Response data:`, data);

            if (!response.ok) {
                console.error(`❌ API Error (${response.status}):`, data);
                throw new Error(data.error || data.message || 'Request failed');
            }

            console.log(`✅ Successful response from ${url}`);
            return data;
        } catch (error) {
            console.error(`❌ API Request Failed for ${url}:`, error);
            throw error;
        }
    }

    // Auth methods
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('authToken', data.token);
        }
        
        return data;
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    // Vehicle methods
    async getVehicles() {
        return this.request('/vehicles');
    }

    async getVehicle(id) {
        return this.request(`/vehicles/${id}`);
    }

    async createVehicle(vehicleData) {
        return this.request('/vehicles', {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
    }

    async updateVehicle(id, vehicleData) {
        return this.request(`/vehicles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(vehicleData)
        });
    }

    async deleteVehicle(id) {
        return this.request(`/vehicles/${id}`, {
            method: 'DELETE'
        });
    }

    async getVehicleStats() {
        return this.request('/vehicles/stats/summary');
    }

    // Driver methods
    async getDrivers() {
        return this.request('/drivers');
    }

    async getDriver(id) {
        return this.request(`/drivers/${id}`);
    }

    async createDriver(driverData) {
        return this.request('/drivers', {
            method: 'POST',
            body: JSON.stringify(driverData)
        });
    }

    async updateDriver(id, driverData) {
        return this.request(`/drivers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(driverData)
        });
    }

    async deleteDriver(id) {
        return this.request(`/drivers/${id}`, {
            method: 'DELETE'
        });
    }

    async getAvailableVehicles() {
        return this.request('/drivers/vehicles/available');
    }

    async getDriverStats() {
        return this.request('/drivers/stats/summary');
    }

    // Trip methods
    async getTrips(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/trips?${queryString}` : '/trips';
        return this.request(endpoint);
    }

    async getTrip(id) {
        return this.request(`/trips/${id}`);
    }

    async createTrip(tripData) {
        return this.request('/trips', {
            method: 'POST',
            body: JSON.stringify(tripData)
        });
    }

    async updateTrip(id, tripData) {
        return this.request(`/trips/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tripData)
        });
    }

    async deleteTrip(id) {
        return this.request(`/trips/${id}`, {
            method: 'DELETE'
        });
    }

    async getTripStats() {
        return this.request('/trips/stats/summary');
    }

    async getTripResources() {
        return this.request('/trips/resources/available');
    }

    // Maintenance methods
    async getMaintenanceRecords(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/maintenance?${queryString}` : '/maintenance';
        return this.request(endpoint);
    }

    async getMaintenanceRecord(id) {
        return this.request(`/maintenance/${id}`);
    }

    async createMaintenanceRecord(recordData) {
        return this.request('/maintenance', {
            method: 'POST',
            body: JSON.stringify(recordData)
        });
    }

    async updateMaintenanceRecord(id, recordData) {
        return this.request(`/maintenance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(recordData)
        });
    }

    async deleteMaintenanceRecord(id) {
        return this.request(`/maintenance/${id}`, {
            method: 'DELETE'
        });
    }

    async getMaintenanceStats() {
        return this.request('/maintenance/stats/summary');
    }

    async getUpcomingMaintenance() {
        return this.request('/maintenance/upcoming');
    }

    // Dashboard methods
    async getDashboardOverview() {
        return this.request('/dashboard/overview');
    }

    async getRecentTrips() {
        return this.request('/dashboard/recent-trips');
    }

    async getFuelAnalysis() {
        return this.request('/dashboard/fuel-analysis');
    }

    async getVehicleStatus() {
        return this.request('/dashboard/vehicle-status');
    }

    async getOperationalCosts() {
        return this.request('/dashboard/operational-costs');
    }

    async getMonthlySummary() {
        return this.request('/dashboard/monthly-summary');
    }

    // Utility methods
    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Create global API instance
const api = new API();

// Utility functions for UI
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    main.insertBefore(alertDiv, main.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function setLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading');
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS',
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
    const date = new Date(`${dateString}T${timeString}`);
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
window.setLoading = setLoading;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
