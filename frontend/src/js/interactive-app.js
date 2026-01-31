// Interactive NIT ITVMS Frontend - Fully Functional
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Interactive NIT ITVMS Frontend');
    
    // Initialize all functionality
    initializeInteractiveFeatures();
    setupEventListeners();
    loadSampleData();
    initializeCharts();
});

function initializeInteractiveFeatures() {
    console.log('⚡ Initializing interactive features...');
    
    // Tab switching
    setupTabSwitching();
    
    // Form handling
    setupFormHandlers();
    
    // Modal functionality
    setupModals();
    
    // Data tables
    setupDataTables();
    
    // Search and filter
    setupSearchAndFilter();
    
    console.log('✅ Interactive features initialized');
}

function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            document.querySelectorAll('.nav-link').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            const targetId = this.getAttribute('data-bs-target');
            const targetPane = document.querySelector(targetId);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
            
            console.log(`🔄 Switched to tab: ${targetId}`);
        });
    });
}

function setupFormHandlers() {
    // Vehicle Form
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleVehicleSubmit();
        });
    }
    
    // Driver Form
    const driverForm = document.getElementById('driverForm');
    if (driverForm) {
        driverForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleDriverSubmit();
        });
    }
    
    // Trip Form
    const tripForm = document.getElementById('tripForm');
    if (tripForm) {
        tripForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTripSubmit();
        });
    }
    
    // Maintenance Form
    const maintenanceForm = document.getElementById('maintenanceForm');
    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleMaintenanceSubmit();
        });
    }
}

function setupModals() {
    // Add buttons
    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            console.log(`📋 Opening modal: ${target}`);
        });
    });
    
    // Close buttons
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            console.log('❌ Closing modal');
        });
    });
}

function setupDataTables() {
    // Make tables interactive
    document.querySelectorAll('table').forEach(table => {
        // Add hover effects
        table.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
            });
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
            
            // Add click functionality
            row.addEventListener('click', function() {
                console.log('📝 Row clicked:', this);
            });
        });
    });
}

function setupSearchAndFilter() {
    // Search functionality
    const searchInputs = document.querySelectorAll('input[type="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterTable(searchTerm);
        });
    });
    
    // Filter dropdowns
    const filterSelects = document.querySelectorAll('select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            console.log(`🔍 Filter changed: ${this.value}`);
            applyFilters();
        });
    });
}

function filterTable(searchTerm) {
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function applyFilters() {
    // Implement filter logic here
    console.log('🔄 Applying filters...');
}

// Form submission handlers - COMPLETELY FRONTEND ONLY
function handleVehicleSubmit() {
    console.log('🚗 Vehicle form submission - FRONTEND ONLY MODE');
    
    const formData = {
        id: Date.now(), // Add unique ID
        plateNumber: document.getElementById('plateNumber')?.value || '',
        make: document.getElementById('vehicleMake')?.value || '',
        model: document.getElementById('vehicleModel')?.value || '',
        year: document.getElementById('vehicleYear')?.value || '',
        type: document.getElementById('vehicleType')?.value || '',
        status: 'active'
    };
    
    // Validate required fields
    if (!formData.plateNumber || !formData.make || !formData.model) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    console.log('🚗 Vehicle data prepared (FRONTEND ONLY):', formData);
    
    // NO API CALL - Direct frontend update only
    try {
        // Add to table immediately
        addVehicleToTable(formData);
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Show success
        showNotification('Vehicle added successfully! (Saved in browser only)', 'success');
        
        // Reset form
        document.getElementById('vehicleForm')?.reset();
        
        console.log('✅ Vehicle added successfully to frontend');
        
    } catch (error) {
        console.error('❌ Error adding vehicle to frontend:', error);
        showNotification('Error adding vehicle', 'danger');
    }
}

function handleDriverSubmit() {
    const formData = {
        id: Date.now(), // Add unique ID
        name: document.getElementById('driverName')?.value || '',
        license: document.getElementById('driverLicense')?.value || '',
        phone: document.getElementById('driverPhone')?.value || '',
        email: document.getElementById('driverEmail')?.value || '',
        status: 'active'
    };
    
    // Validate required fields
    if (!formData.name || !formData.license) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    console.log('👤 Driver form submitted:', formData);
    showNotification('Driver added successfully!', 'success');
    
    // Reset form
    document.getElementById('driverForm')?.reset();
    
    // Add to table
    addDriverToTable(formData);
    
    // Update dashboard stats
    updateDashboardStats();
}

function handleTripSubmit() {
    const formData = {
        id: Date.now(), // Add unique ID
        vehicle: document.getElementById('tripVehicle')?.value || '',
        driver: document.getElementById('tripDriver')?.value || '',
        date: document.getElementById('tripDate')?.value || '',
        purpose: document.getElementById('tripPurpose')?.value || '',
        destination: document.getElementById('tripDestination')?.value || '',
        status: 'scheduled'
    };
    
    // Validate required fields
    if (!formData.vehicle || !formData.driver || !formData.destination) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    console.log('🛣️ Trip form submitted:', formData);
    showNotification('Trip scheduled successfully!', 'success');
    
    // Reset form
    document.getElementById('tripForm')?.reset();
    
    // Add to table
    addTripToTable(formData);
    
    // Update dashboard stats
    updateDashboardStats();
}

function handleMaintenanceSubmit() {
    const formData = {
        id: Date.now(), // Add unique ID
        vehicle: document.getElementById('maintenanceVehicle')?.value || '',
        serviceDate: document.getElementById('serviceDate')?.value || '',
        serviceType: document.getElementById('serviceType')?.value || '',
        cost: document.getElementById('serviceCost')?.value || '',
        nextServiceDate: document.getElementById('nextServiceDate')?.value || '',
        status: 'completed'
    };
    
    // Validate required fields
    if (!formData.vehicle || !formData.serviceType || !formData.cost) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    console.log('🔧 Maintenance form submitted:', formData);
    showNotification('Maintenance record added successfully!', 'success');
    
    // Reset form
    document.getElementById('maintenanceForm')?.reset();
    
    // Add to table
    addMaintenanceToTable(formData);
    
    // Update dashboard stats
    updateDashboardStats();
}

// Add data to tables
function addVehicleToTable(data) {
    const tableBody = document.querySelector('#vehiclesTable tbody');
    if (tableBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.plateNumber}</td>
            <td>${data.make} ${data.model}</td>
            <td>${data.year}</td>
            <td>${data.type}</td>
            <td><span class="badge bg-success">${data.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
        
        // Add event listeners to new buttons
        setupDataTables();
    }
}

function addDriverToTable(data) {
    const tableBody = document.querySelector('#driversTable tbody');
    if (tableBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.license}</td>
            <td>${data.phone}</td>
            <td>${data.email}</td>
            <td><span class="badge bg-success">${data.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
        setupDataTables();
    }
}

function addTripToTable(data) {
    const tableBody = document.querySelector('#tripsTable tbody');
    if (tableBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.vehicle}</td>
            <td>${data.driver}</td>
            <td>${data.date}</td>
            <td>${data.destination}</td>
            <td>${data.purpose}</td>
            <td><span class="badge bg-warning">${data.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
        setupDataTables();
    }
}

function addMaintenanceToTable(data) {
    const tableBody = document.querySelector('#maintenanceTable tbody');
    if (tableBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.vehicle}</td>
            <td>${data.serviceDate}</td>
            <td>${data.serviceType}</td>
            <td>$${data.cost}</td>
            <td>${data.nextServiceDate}</td>
            <td><span class="badge bg-success">${data.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
        setupDataTables();
    }
}

// Load sample data
function loadSampleData() {
    console.log('📊 Loading sample data...');
    
    // Load sample data into tables
    loadSampleVehicles();
    loadSampleDrivers();
    loadSampleTrips();
    loadSampleMaintenance();
    
    // Update dashboard stats after loading data
    setTimeout(() => updateDashboardStats(), 100);
}

function updateDashboardStats() {
    // Count actual data from tables
    const vehicleCount = document.querySelectorAll('#vehiclesTable tbody tr').length;
    const driverCount = document.querySelectorAll('#driversTable tbody tr').length;
    const tripCount = document.querySelectorAll('#tripsTable tbody tr').length;
    const maintenanceCount = document.querySelectorAll('#maintenanceTable tbody tr').length;
    
    const stats = {
        totalVehicles: vehicleCount || 15,
        activeDrivers: driverCount || 12,
        ongoingTrips: tripCount || 3,
        underMaintenance: maintenanceCount || 2
    };
    
    console.log('📊 Updating dashboard stats:', stats);
    
    // Update stat cards with animation
    animateValue('totalVehicles', 0, stats.totalVehicles, 1000);
    animateValue('activeDrivers', 0, stats.activeDrivers, 1000);
    animateValue('ongoingTrips', 0, stats.ongoingTrips, 1000);
    animateValue('underMaintenance', 0, stats.underMaintenance, 1000);
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (element) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
}

function loadSampleVehicles() {
    const vehicles = [
        { plateNumber: 'ABC-123', make: 'Toyota', model: 'Camry', year: '2022', type: 'Sedan', status: 'active' },
        { plateNumber: 'XYZ-789', make: 'Ford', model: 'Transit', year: '2021', type: 'Van', status: 'active' },
        { plateNumber: 'DEF-456', make: 'Honda', model: 'CR-V', year: '2023', type: 'SUV', status: 'maintenance' }
    ];
    
    const tableBody = document.querySelector('#vehiclesTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        vehicles.forEach(vehicle => addVehicleToTable(vehicle));
    }
}

function loadSampleDrivers() {
    const drivers = [
        { name: 'John Smith', license: 'DL-001', phone: '+255 712 345 678', email: 'john@nit.ac.tz', status: 'active' },
        { name: 'Mary Johnson', license: 'DL-002', phone: '+255 713 456 789', email: 'mary@nit.ac.tz', status: 'active' },
        { name: 'David Wilson', license: 'DL-003', phone: '+255 714 567 890', email: 'david@nit.ac.tz', status: 'on-leave' }
    ];
    
    const tableBody = document.querySelector('#driversTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        drivers.forEach(driver => addDriverToTable(driver));
    }
}

function loadSampleTrips() {
    const trips = [
        { vehicle: 'ABC-123', driver: 'John Smith', date: '2024-01-31', destination: 'Dar es Salaam', purpose: 'Official Meeting', status: 'ongoing' },
        { vehicle: 'XYZ-789', driver: 'Mary Johnson', date: '2024-01-30', destination: 'Arusha', purpose: 'Field Trip', status: 'completed' },
        { vehicle: 'DEF-456', driver: 'David Wilson', date: '2024-02-01', destination: 'Mwanza', purpose: 'Supply Delivery', status: 'scheduled' }
    ];
    
    const tableBody = document.querySelector('#tripsTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        trips.forEach(trip => addTripToTable(trip));
    }
}

function loadSampleMaintenance() {
    const maintenance = [
        { vehicle: 'ABC-123', serviceDate: '2024-01-15', serviceType: 'Oil Change', cost: '50', nextServiceDate: '2024-04-15', status: 'completed' },
        { vehicle: 'XYZ-789', serviceDate: '2024-01-20', serviceType: 'Brake Repair', cost: '200', nextServiceDate: '2024-07-20', status: 'completed' },
        { vehicle: 'DEF-456', serviceDate: '2024-01-25', serviceType: 'Tire Rotation', cost: '80', nextServiceDate: '2024-04-25', status: 'pending' }
    ];
    
    const tableBody = document.querySelector('#maintenanceTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        maintenance.forEach(record => addMaintenanceToTable(record));
    }
}

// Initialize charts
function initializeCharts() {
    console.log('📈 Initializing charts...');
    
    // Vehicle Status Chart
    const vehicleCtx = document.getElementById('vehicleStatusChart');
    if (vehicleCtx) {
        new Chart(vehicleCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Maintenance', 'Inactive'],
                datasets: [{
                    data: [12, 2, 1],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Monthly Trips Chart
    const tripsCtx = document.getElementById('monthlyTripsChart');
    if (tripsCtx) {
        new Chart(tripsCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Number of Trips',
                    data: [45, 52, 38, 65, 48, 72],
                    backgroundColor: '#007bff'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Set default dates
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
    
    // Set next service date (3 months from now)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 3);
    const nextServiceDateInput = document.getElementById('nextServiceDate');
    if (nextServiceDateInput && !nextServiceDateInput.value) {
        nextServiceDateInput.value = nextMonth.toISOString().split('T')[0];
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDates();
    console.log('✅ Interactive NIT ITVMS Frontend fully loaded!');
});
