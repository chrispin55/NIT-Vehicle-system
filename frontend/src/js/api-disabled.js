// API DISABLED - Frontend Only Mode
console.log('🚫 API DISABLED - Working in Frontend Only Mode');

// Disabled API class - prevents backend calls
class API {
    constructor() {
        console.log('🔌 API Constructor - DISABLED');
        this.baseURL = null;
        this.token = null;
    }
    
    // All API methods are disabled and return mock data
    async request(endpoint, options = {}) {
        console.log(`🚫 API Call Blocked: ${endpoint} - Frontend Only Mode`);
        return Promise.resolve({ message: 'Frontend Only Mode - API Disabled' });
    }
    
    // Disabled auth methods
    async login(username, password) {
        console.log('🚫 Login Disabled - Frontend Only Mode');
        return Promise.resolve({ message: 'Frontend Only Mode' });
    }
    
    // Disabled dashboard methods
    async getDashboardOverview() {
        console.log('🚫 Dashboard API Disabled - Using Frontend Data');
        return Promise.resolve({
            vehicles: { total: 15, active: 12, maintenance: 2, inactive: 1 },
            drivers: { total: 12, active: 10, onLeave: 2 },
            trips: { total: 45, ongoing: 3, completed: 40, scheduled: 2 },
            maintenance: { total: 8, upcoming: 2, completed: 6 }
        });
    }
    
    // All other methods disabled
    async getRecentTrips() { return Promise.resolve([]); }
    async getVehicles() { return Promise.resolve([]); }
    async getDrivers() { return Promise.resolve([]); }
    async getTrips() { return Promise.resolve([]); }
    async getMaintenanceRecords() { return Promise.resolve([]); }
    
    // Mock notification system
    showAlert(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Mock loading functions
    setLoading(elementId, loading = false) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.opacity = loading ? '0.5' : '1';
        }
    }
}

// Create disabled API instance
const api = new API();

// Export for use in other files
window.api = api;

console.log('✅ API Disabled - Frontend Only Mode Active');
