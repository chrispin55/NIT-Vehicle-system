// PROJECT KALI - ITVMS Event Handlers and Chart Initialization
// NIT University Dar es Salaam

// Initialize charts
function initializeCharts() {
    // Fuel Cost Chart
    const fuelCtx = document.getElementById('fuelCostChart')?.getContext('2d');
    if (fuelCtx) {
        new Chart(fuelCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Fuel Cost (TZS)',
                    data: [3200000, 3500000, 3100000, 3800000, 4000000, 4200000, 4100000, 4520000, 3980000, 4250000],
                    backgroundColor: 'rgba(0, 51, 102, 0.7)',
                    borderColor: 'rgba(0, 51, 102, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toFixed(1) + 'M TZS';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Vehicle Status Chart
    const statusCtx = document.getElementById('vehicleStatusChart')?.getContext('2d');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Under Maintenance', 'Inactive'],
                datasets: [{
                    data: [18, 3, 3],
                    backgroundColor: [
                        'rgba(25, 135, 84, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(220, 53, 69, 0.7)'
                    ],
                    borderColor: [
                        'rgba(25, 135, 84, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Operational Cost Chart
    const operationalCtx = document.getElementById('operationalCostChart')?.getContext('2d');
    if (operationalCtx) {
        new Chart(operationalCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [
                    {
                        label: 'Fuel Cost',
                        data: [3200000, 3500000, 3100000, 3800000, 4000000, 4200000, 4100000, 4520000, 3980000, 4250000],
                        borderColor: 'rgba(0, 51, 102, 1)',
                        backgroundColor: 'rgba(0, 51, 102, 0.1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Maintenance Cost',
                        data: [450000, 520000, 380000, 600000, 550000, 720000, 480000, 850000, 420000, 650000],
                        borderColor: 'rgba(220, 53, 69, 1)',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toFixed(1) + 'M TZS';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Login functionality
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('itvms_loggedIn') === 'true';
    if (isLoggedIn) {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        AppData.init();
        initializeCharts();
    }
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (for demo purposes)
        if (username === 'admin' && password === 'nit2023') {
            localStorage.setItem('itvms_loggedIn', 'true');
            localStorage.setItem('itvms_username', username);
            
            document.getElementById('currentUser').textContent = 'Administrator';
            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            
            // Initialize application data and charts
            AppData.init();
            initializeCharts();
            
            AppData.showAlert('Login successful! Welcome to PROJECT KALI ITVMS.', 'success');
        } else {
            AppData.showAlert('Invalid credentials. Use "admin" and "nit2023" for demo access.', 'danger');
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('itvms_loggedIn');
            localStorage.removeItem('itvms_username');
            
            appContainer.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            
            // Reset login form
            loginForm.reset();
            
            AppData.showAlert('Logged out successfully!', 'info');
        }
    });
    
    // Vehicle form submission
    const addVehicleForm = document.getElementById('addVehicleForm');
    addVehicleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            plateNumber: document.getElementById('plateNumber').value,
            vehicleType: document.getElementById('vehicleType').value,
            vehicleModel: document.getElementById('vehicleModel').value,
            manufactureYear: document.getElementById('manufactureYear').value,
            vehicleStatus: document.getElementById('vehicleStatus').value,
            vehicleCapacity: document.getElementById('vehicleCapacity').value
        };
        
        // Check if we're updating or adding
        if (this.dataset.editId) {
            AppData.updateVehicle(parseInt(this.dataset.editId), formData);
            // Reset form to add mode
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Add Vehicle';
            delete this.dataset.editId;
        } else {
            AppData.addVehicle(formData);
        }
        
        this.reset();
    });
    
    // Driver form submission
    const addDriverForm = document.getElementById('addDriverForm');
    addDriverForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            driverName: document.getElementById('driverName').value,
            licenseNumber: document.getElementById('licenseNumber').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            experience: document.getElementById('experience').value,
            assignedVehicle: document.getElementById('assignedVehicle').value
        };
        
        // Check if we're updating or adding
        if (this.dataset.editId) {
            AppData.updateDriver(parseInt(this.dataset.editId), formData);
            // Reset form to add mode
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Add Driver';
            delete this.dataset.editId;
        } else {
            AppData.addDriver(formData);
        }
        
        this.reset();
    });
    
    // Trip form submission
    const addTripForm = document.getElementById('addTripForm');
    addTripForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            tripRoute: document.getElementById('tripRoute').value,
            tripDriver: document.getElementById('tripDriver').value,
            tripVehicle: document.getElementById('tripVehicle').value,
            tripDate: document.getElementById('tripDate').value,
            tripTime: document.getElementById('tripTime').value,
            fuelUsed: document.getElementById('fuelUsed').value,
            passengerCount: document.getElementById('passengerCount').value,
            tripPurpose: document.getElementById('tripPurpose').value
        };
        
        AppData.addTrip(formData);
        this.reset();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tripDate').value = today;
    });
    
    // Maintenance form submission
    const addMaintenanceForm = document.getElementById('addMaintenanceForm');
    addMaintenanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            maintenanceVehicle: document.getElementById('maintenanceVehicle').value,
            serviceDate: document.getElementById('serviceDate').value,
            serviceType: document.getElementById('serviceType').value,
            serviceCost: document.getElementById('serviceCost').value,
            serviceDescription: document.getElementById('serviceDescription').value,
            nextServiceDate: document.getElementById('nextServiceDate').value
        };
        
        AppData.addMaintenance(formData);
        this.reset();
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 3);
        document.getElementById('serviceDate').value = today;
        document.getElementById('nextServiceDate').value = nextMonth.toISOString().split('T')[0];
    });
    
    // Set default dates for forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tripDate').value = today;
    document.getElementById('serviceDate').value = today;
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 3);
    document.getElementById('nextServiceDate').value = nextMonth.toISOString().split('T')[0];
    
    // Event listeners for filters and searches
    document.getElementById('showActiveOnly').addEventListener('change', function() {
        AppData.renderVehicles();
    });
    
    document.querySelectorAll('input[name="tripFilter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            AppData.renderTrips();
        });
    });
    
    document.getElementById('searchMaintenance').addEventListener('input', function() {
        AppData.renderMaintenance();
    });
    
    // Report generation
    document.getElementById('generateReport').addEventListener('click', function() {
        const reportType = document.getElementById('reportType').value;
        const reportPeriod = document.getElementById('reportPeriod').value;
        
        let message = `Generating ${reportType} report for ${reportPeriod}`;
        if (reportPeriod === 'custom') {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            message += ` from ${startDate} to ${endDate}`;
        }
        
        AppData.showAlert(`${message}. Report would be downloaded in a real system.`, 'info');
    });
    
    // Custom date range toggle
    document.getElementById('reportPeriod').addEventListener('change', function() {
        const customRange = document.getElementById('customRange');
        if (this.value === 'custom') {
            customRange.classList.remove('d-none');
        } else {
            customRange.classList.add('d-none');
        }
    });
    
    // Export data button
    document.getElementById('exportData').addEventListener('click', function() {
        AppData.exportData();
    });
    
    // Reset forms when switching tabs (except when editing)
    document.querySelectorAll('#mainTab button').forEach(tab => {
        tab.addEventListener('click', function() {
            // Reset vehicle form if not in edit mode
            if (!addVehicleForm.dataset.editId) {
                addVehicleForm.reset();
                const submitBtn = addVehicleForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Add Vehicle';
            }
            
            // Reset driver form if not in edit mode
            if (!addDriverForm.dataset.editId) {
                addDriverForm.reset();
                const submitBtn = addDriverForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Add Driver';
            }
            
            // Reset other forms
            addTripForm.reset();
            document.getElementById('tripDate').value = today;
            
            addMaintenanceForm.reset();
            document.getElementById('serviceDate').value = today;
            document.getElementById('nextServiceDate').value = nextMonth.toISOString().split('T')[0];
        });
    });
});
