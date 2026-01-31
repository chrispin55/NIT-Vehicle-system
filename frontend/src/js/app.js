// Main Application JavaScript - FRONTEND ONLY MODE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Starting NIT ITVMS (Frontend Only Mode)');
    
    // NO API CONNECTION TEST - Frontend Only Mode
    console.log('🔌 Frontend Only Mode - No API Connection Required');
    
    // Initialize application
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // NO DASHBOARD DATA LOADING - Handled by interactive-app.js
    console.log('📊 Dashboard will be loaded by interactive-app.js');
});

function initializeApp() {
    // Set default date values
    const today = new Date().toISOString().split('T')[0];
    const tripDateInput = document.getElementById('tripDate');
    const serviceDateInput = document.getElementById('serviceDate');
    
    if (tripDateInput) tripDateInput.value = today;
    if (serviceDateInput) serviceDateInput.value = today;
    
    // Set next service date (3 months from now)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 3);
    const nextServiceDateInput = document.getElementById('nextServiceDate');
    if (nextServiceDateInput) nextServiceDateInput.value = nextMonth.toISOString().split('T')[0];
    
    console.log('🚀 NIT ITVMS initialized');
}

function setupEventListeners() {
    // Tab change events
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const target = e.target.getAttribute('data-bs-target');
            loadTabData(target);
        });
    });
    
    // Form submissions
    setupVehicleForm();
    setupDriverForm();
    setupTripForm();
    setupMaintenanceForm();
    
    // Report generation
    const generateReportBtn = document.getElementById('generateReport');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // Report period change
    const reportPeriodSelect = document.getElementById('reportPeriod');
    if (reportPeriodSelect) {
        reportPeriodSelect.addEventListener('change', function() {
            const customRange = document.getElementById('customRange');
            if (this.value === 'custom') {
                customRange.classList.remove('d-none');
            } else {
                customRange.classList.add('d-none');
            }
        });
    }
}

function loadTabData(target) {
    switch(target) {
        case '#dashboard':
            loadDashboardData();
            break;
        case '#vehicles':
            loadVehicles();
            break;
        case '#drivers':
            loadDrivers();
            loadAvailableVehicles();
            break;
        case '#trips':
            loadTrips();
            loadTripResources();
            break;
        case '#maintenance':
            loadMaintenanceRecords();
            loadMaintenanceVehicles();
            break;
        case '#reports':
            loadReportsData();
            break;
    }
}

// Dashboard Functions - DISABLED (Handled by interactive-app.js)
async function loadDashboardData() {
    console.log('📊 loadDashboardData DISABLED - Using interactive-app.js instead');
    // This function is disabled - interactive-app.js handles dashboard loading
}

function updateDashboardStats(overview) {
    console.log('📈 updateDashboardStats DISABLED - Using interactive-app.js instead');
}

function updateRecentTripsTable(trips) {
    console.log('🚗 updateRecentTripsTable DISABLED - Using interactive-app.js instead');
}

function loadDashboardCharts() {
    console.log('📊 loadDashboardCharts DISABLED - Using interactive-app.js instead');
}

// Vehicle Functions
async function loadVehicles() {
    try {
        const vehicles = await api.getVehicles();
        updateVehiclesTable(vehicles);
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showAlert('Failed to load vehicles', 'danger');
    }
}

function updateVehiclesTable(vehicles) {
    const tbody = document.getElementById('vehicleList');
    if (!tbody) return;
    
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No vehicles found</td></tr>';
        return;
    }
    
    tbody.innerHTML = vehicles.map(vehicle => `
        <tr class="vehicle-status-${vehicle.status.toLowerCase().replace(' ', '-')}">
            <td>${vehicle.plate_number}</td>
            <td>${vehicle.vehicle_type}</td>
            <td>${vehicle.model}</td>
            <td>${vehicle.manufacture_year}</td>
            <td><span class="badge-status badge-${vehicle.status.toLowerCase().replace(' ', '-')}">${vehicle.status}</span></td>
            <td>
                <button class="btn btn-sm btn-nit-outline me-1" onclick="editVehicle(${vehicle.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${vehicle.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function setupVehicleForm() {
    const form = document.getElementById('addVehicleForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);
        
        try {
            const vehicleData = {
                plate_number: document.getElementById('plateNumber').value,
                vehicle_type: document.getElementById('vehicleType').value,
                model: document.getElementById('vehicleModel').value,
                manufacture_year: parseInt(document.getElementById('manufactureYear').value),
                status: document.getElementById('vehicleStatus').value
            };
            
            await api.createVehicle(vehicleData);
            showAlert('Vehicle added successfully!', 'success');
            form.reset();
            loadVehicles();
        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// Driver Functions
async function loadDrivers() {
    try {
        const drivers = await api.getDrivers();
        updateDriversTable(drivers);
    } catch (error) {
        console.error('Error loading drivers:', error);
        showAlert('Failed to load drivers', 'danger');
    }
}

function updateDriversTable(drivers) {
    const tbody = document.getElementById('driverList');
    if (!tbody) return;
    
    if (drivers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No drivers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = drivers.map(driver => `
        <tr>
            <td>${driver.driver_id}</td>
            <td>${driver.full_name}</td>
            <td>${driver.license_number}</td>
            <td>${driver.experience_years} years</td>
            <td>${driver.assignedVehicle?.plate_number || 'Not Assigned'}</td>
            <td><span class="badge-status badge-${driver.status.toLowerCase()}">${driver.status}</span></td>
        </tr>
    `).join('');
}

async function loadAvailableVehicles() {
    try {
        const vehicles = await api.getAvailableVehicles();
        const select = document.getElementById('assignedVehicle');
        if (!select) return;
        
        select.innerHTML = '<option value="">Not Assigned</option>' +
            vehicles.map(vehicle => 
                `<option value="${vehicle.id}">${vehicle.plate_number} (${vehicle.model})</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading available vehicles:', error);
    }
}

function setupDriverForm() {
    const form = document.getElementById('addDriverForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);
        
        try {
            const driverData = {
                driver_id: `DRV-${Date.now().toString().slice(-3)}`,
                full_name: document.getElementById('driverName').value,
                license_number: document.getElementById('licenseNumber').value,
                experience_years: parseInt(document.getElementById('experience').value),
                assigned_vehicle_id: document.getElementById('assignedVehicle').value || null
            };
            
            await api.createDriver(driverData);
            showAlert('Driver added successfully!', 'success');
            form.reset();
            loadDrivers();
        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// Trip Functions
async function loadTrips() {
    try {
        const trips = await api.getTrips();
        updateTripsTable(trips);
    } catch (error) {
        console.error('Error loading trips:', error);
        showAlert('Failed to load trips', 'danger');
    }
}

function updateTripsTable(trips) {
    const tbody = document.getElementById('tripList');
    if (!tbody) return;
    
    if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No trips found</td></tr>';
        return;
    }
    
    tbody.innerHTML = trips.map(trip => `
        <tr>
            <td>${trip.trip_id}</td>
            <td>${trip.route}</td>
            <td>${trip.driver?.full_name || 'N/A'}</td>
            <td>${trip.vehicle?.plate_number || 'N/A'}</td>
            <td>${formatDateTime(trip.trip_date, trip.trip_time)}</td>
            <td><span class="badge-status badge-${trip.status.toLowerCase().replace(' ', '-')}">${trip.status}</span></td>
        </tr>
    `).join('');
}

async function loadTripResources() {
    try {
        const resources = await api.getTripResources();
        
        // Populate driver select
        const driverSelect = document.getElementById('tripDriver');
        if (driverSelect) {
            driverSelect.innerHTML = '<option value="">Select Driver</option>' +
                resources.drivers.map(driver => 
                    `<option value="${driver.id}">${driver.full_name} (${driver.driver_id})</option>`
                ).join('');
        }
        
        // Populate vehicle select
        const vehicleSelect = document.getElementById('tripVehicle');
        if (vehicleSelect) {
            vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>' +
                resources.vehicles.map(vehicle => 
                    `<option value="${vehicle.id}">${vehicle.plate_number} (${vehicle.model})</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading trip resources:', error);
    }
}

function setupTripForm() {
    const form = document.getElementById('addTripForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);
        
        try {
            const tripData = {
                trip_id: `TR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
                route: document.getElementById('tripRoute').value,
                driver_id: parseInt(document.getElementById('tripDriver').value),
                vehicle_id: parseInt(document.getElementById('tripVehicle').value),
                trip_date: document.getElementById('tripDate').value,
                trip_time: document.getElementById('tripTime').value + ':00',
                estimated_fuel_liters: parseFloat(document.getElementById('fuelUsed').value)
            };
            
            await api.createTrip(tripData);
            showAlert('Trip scheduled successfully!', 'success');
            form.reset();
            
            // Reset date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('tripDate').value = today;
            
            loadTrips();
        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// Maintenance Functions
async function loadMaintenanceRecords() {
    try {
        const records = await api.getMaintenanceRecords();
        updateMaintenanceTable(records);
    } catch (error) {
        console.error('Error loading maintenance records:', error);
        showAlert('Failed to load maintenance records', 'danger');
    }
}

function updateMaintenanceTable(records) {
    const tbody = document.getElementById('maintenanceList');
    if (!tbody) return;
    
    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No maintenance records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${record.vehicle?.plate_number || 'N/A'}</td>
            <td>${formatDate(record.service_date)}</td>
            <td>${record.service_type}</td>
            <td>${formatCurrency(record.cost)}</td>
            <td>${formatDate(record.next_service_date)}</td>
        </tr>
    `).join('');
}

async function loadMaintenanceVehicles() {
    try {
        const vehicles = await api.getVehicles();
        const select = document.getElementById('maintenanceVehicle');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Vehicle</option>' +
            vehicles.map(vehicle => 
                `<option value="${vehicle.id}">${vehicle.plate_number} (${vehicle.model})</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}

function setupMaintenanceForm() {
    const form = document.getElementById('addMaintenanceForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);
        
        try {
            const maintenanceData = {
                vehicle_id: parseInt(document.getElementById('maintenanceVehicle').value),
                service_date: document.getElementById('serviceDate').value,
                service_type: document.getElementById('serviceType').value,
                cost: parseFloat(document.getElementById('serviceCost').value),
                next_service_date: document.getElementById('nextServiceDate').value
            };
            
            await api.createMaintenanceRecord(maintenanceData);
            showAlert('Service record added successfully!', 'success');
            form.reset();
            
            // Reset dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('serviceDate').value = today;
            
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 3);
            document.getElementById('nextServiceDate').value = nextMonth.toISOString().split('T')[0];
            
            loadMaintenanceRecords();
        } catch (error) {
            showAlert(error.message, 'danger');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// Reports Functions
async function loadReportsData() {
    try {
        // Load operational costs chart
        const operationalCosts = await api.getOperationalCosts();
        createOperationalCostChart(operationalCosts);
        
        // Load monthly summary table
        const monthlySummary = await api.getMonthlySummary();
        updateMonthlySummaryTable(monthlySummary);
    } catch (error) {
        console.error('Error loading reports data:', error);
    }
}

function updateMonthlySummaryTable(summary) {
    const tbody = document.getElementById('monthlySummaryTable');
    if (!tbody) return;
    
    if (summary.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No data available</td></tr>';
        return;
    }
    
    tbody.innerHTML = summary.map(month => `
        <tr>
            <td>${month.month}</td>
            <td>${month.trips}</td>
            <td>${formatCurrency(month.fuelCost)}</td>
            <td>${formatCurrency(month.maintenanceCost)}</td>
            <td>${formatCurrency(month.operationalCost)}</td>
            <td>${month.utilization}%</td>
        </tr>
    `).join('');
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    showAlert(`Generating ${reportType} report for ${reportPeriod}... This feature will be available soon!`, 'info');
}

// Chart Functions
function createFuelCostChart(data) {
    const ctx = document.getElementById('fuelCostChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Fuel Cost (TZS)',
                data: data.map(d => d.cost),
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
                            return value.toLocaleString() + ' TZS';
                        }
                    }
                }
            }
        }
    });
}

function createVehicleStatusChart(data) {
    const ctx = document.getElementById('vehicleStatusChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active', 'Under Maintenance', 'Inactive'],
            datasets: [{
                data: [data.Active, data['Under Maintenance'], data.Inactive],
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

function createOperationalCostChart(data) {
    const ctx = document.getElementById('operationalCostChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.month),
            datasets: [
                {
                    label: 'Fuel Cost',
                    data: data.map(d => d.fuelCost),
                    borderColor: 'rgba(0, 51, 102, 1)',
                    backgroundColor: 'rgba(0, 51, 102, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Maintenance Cost',
                    data: data.map(d => d.maintenanceCost),
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

// Placeholder functions for edit/delete operations
function editVehicle(id) {
    showAlert('Edit functionality will be implemented soon!', 'info');
}

function deleteVehicle(id) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        showAlert('Delete functionality will be implemented soon!', 'info');
    }
}
