// PROJECT KALI - ITVMS JavaScript Application
// NIT University Dar es Salaam

// Application Data Storage
const AppData = {
    vehicles: [],
    drivers: [],
    trips: [],
    maintenance: [],
    user: null,
    
    init: function() {
        // Load data from localStorage
        this.loadData();
        
        // Set default data if empty
        if (this.vehicles.length === 0) {
            this.setDefaultData();
        }
        
        // Update stats
        this.updateDashboardStats();
        
        // Render initial data
        this.renderVehicles();
        this.renderDrivers();
        this.renderTrips();
        this.renderMaintenance();
        this.renderMonthlySummary();
        this.populateVehicleDropdowns();
        this.populateDriverDropdowns();
        this.renderRecentTrips();
    },
    
    loadData: function() {
        // Load data from localStorage
        const vehiclesData = localStorage.getItem('itvms_vehicles');
        const driversData = localStorage.getItem('itvms_drivers');
        const tripsData = localStorage.getItem('itvms_trips');
        const maintenanceData = localStorage.getItem('itvms_maintenance');
        
        this.vehicles = vehiclesData ? JSON.parse(vehiclesData) : [];
        this.drivers = driversData ? JSON.parse(driversData) : [];
        this.trips = tripsData ? JSON.parse(tripsData) : [];
        this.maintenance = maintenanceData ? JSON.parse(maintenanceData) : [];
    },
    
    saveData: function() {
        // Save data to localStorage
        localStorage.setItem('itvms_vehicles', JSON.stringify(this.vehicles));
        localStorage.setItem('itvms_drivers', JSON.stringify(this.drivers));
        localStorage.setItem('itvms_trips', JSON.stringify(this.trips));
        localStorage.setItem('itvms_maintenance', JSON.stringify(this.maintenance));
        
        // Update dashboard stats
        this.updateDashboardStats();
    },
    
    setDefaultData: function() {
        // Default vehicles
        this.vehicles = [
            {id: 1, plate: 'T 123 ABC', type: 'Minibus', model: 'Toyota Hiace', year: 2021, capacity: 18, status: 'Active'},
            {id: 2, plate: 'T 456 DEF', type: 'SUV', model: 'Nissan Patrol', year: 2019, capacity: 8, status: 'Under Maintenance'},
            {id: 3, plate: 'T 789 GHI', type: 'SUV', model: 'Toyota Land Cruiser', year: 2022, capacity: 7, status: 'Active'},
            {id: 4, plate: 'T 101 JKL', type: 'Bus', model: 'Coaster Bus', year: 2020, capacity: 30, status: 'Active'},
            {id: 5, plate: 'T 202 MNO', type: 'Sedan', model: 'Toyota Corolla', year: 2021, capacity: 5, status: 'Inactive'}
        ];
        
        // Default drivers
        this.drivers = [
            {id: 1, name: 'John Mwambene', license: 'DL-123456', phone: '255-789-456123', experience: 8, assignedVehicle: 'T 123 ABC', status: 'Active'},
            {id: 2, name: 'Sarah Juma', license: 'DL-234567', phone: '255-712-345678', experience: 5, assignedVehicle: 'T 456 DEF', status: 'Active'},
            {id: 3, name: 'Robert Kimambo', license: 'DL-345678', phone: '255-754-987654', experience: 12, assignedVehicle: 'T 789 GHI', status: 'Active'},
            {id: 4, name: 'Michael Shayo', license: 'DL-456789', phone: '255-768-123456', experience: 3, assignedVehicle: '', status: 'Active'}
        ];
        
        // Default trips
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        
        this.trips = [
            {id: 1, tripId: 'TR-2023-045', route: 'NIT Campus → Julius Nyerere Airport', driver: 'John Mwambene', vehicle: 'T 123 ABC', date: '2023-10-15', time: '08:00', fuel: 50, passengers: 12, purpose: 'Academic', status: 'In Progress'},
            {id: 2, tripId: 'TR-2023-044', route: 'NIT Campus → City Center', driver: 'Sarah Juma', vehicle: 'T 456 DEF', date: '2023-10-14', time: '10:30', fuel: 35, passengers: 6, purpose: 'Administrative', status: 'Completed'},
            {id: 3, tripId: 'TR-2023-043', route: 'NIT Campus → Mlimani City', driver: 'Robert Kimambo', vehicle: 'T 789 GHI', date: '2023-10-13', time: '14:00', fuel: 40, passengers: 5, purpose: 'Event', status: 'Completed'},
            {id: 4, tripId: 'TR-2023-046', route: 'NIT Campus → Ubungo Bus Terminal', driver: 'Michael Shayo', vehicle: 'T 101 JKL', date: today.toISOString().split('T')[0], time: '09:00', fuel: 60, passengers: 25, purpose: 'Academic', status: 'Scheduled'}
        ];
        
        // Default maintenance records
        this.maintenance = [
            {id: 1, vehicle: 'T 456 DEF', date: '2023-10-10', type: 'Brake Repair', description: 'Complete brake system overhaul', cost: 350000, nextDate: '2024-01-10'},
            {id: 2, vehicle: 'T 123 ABC', date: '2023-10-05', type: 'Routine Maintenance', description: 'Regular service and inspection', cost: 180000, nextDate: '2024-01-05'},
            {id: 3, vehicle: 'T 789 GHI', date: '2023-09-28', type: 'Oil Change', description: 'Engine oil and filter change', cost: 120000, nextDate: '2023-12-28'},
            {id: 4, vehicle: 'T 101 JKL', date: '2023-09-15', type: 'Tire Replacement', description: 'Replaced all 4 tires', cost: 450000, nextDate: '2024-03-15'}
        ];
        
        // Save default data
        this.saveData();
    },
    
    updateDashboardStats: function() {
        const totalVehicles = this.vehicles.length;
        const totalDrivers = this.drivers.filter(d => d.status === 'Active').length;
        const ongoingTrips = this.trips.filter(t => t.status === 'In Progress').length;
        const underMaintenance = this.vehicles.filter(v => v.status === 'Under Maintenance').length;
        
        document.getElementById('totalVehicles').textContent = totalVehicles;
        document.getElementById('totalDrivers').textContent = totalDrivers;
        document.getElementById('ongoingTrips').textContent = ongoingTrips;
        document.getElementById('underMaintenance').textContent = underMaintenance;
    },
    
    renderVehicles: function() {
        const vehicleList = document.getElementById('vehicleList');
        const showActiveOnly = document.getElementById('showActiveOnly').checked;
        
        let filteredVehicles = this.vehicles;
        if (showActiveOnly) {
            filteredVehicles = this.vehicles.filter(v => v.status === 'Active');
        }
        
        vehicleList.innerHTML = filteredVehicles.map(vehicle => `
            <tr class="vehicle-status-${vehicle.status.toLowerCase().replace(' ', '-')}">
                <td>${vehicle.plate}</td>
                <td>${vehicle.type}</td>
                <td>${vehicle.model}</td>
                <td>${vehicle.year}</td>
                <td>${vehicle.capacity}</td>
                <td><span class="badge-status ${this.getStatusClass(vehicle.status)}">${vehicle.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-nit-outline me-1" onclick="AppData.editVehicle(${vehicle.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AppData.deleteVehicle(${vehicle.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    renderDrivers: function() {
        const driverList = document.getElementById('driverList');
        driverList.innerHTML = this.drivers.map(driver => `
            <tr>
                <td>DRV-${driver.id.toString().padStart(3, '0')}</td>
                <td>${driver.name}</td>
                <td>${driver.license}</td>
                <td>${driver.phone}</td>
                <td>${driver.experience} years</td>
                <td>${driver.assignedVehicle || 'Not Assigned'}</td>
                <td><span class="badge-status badge-active">${driver.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-nit-outline me-1" onclick="AppData.editDriver(${driver.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AppData.deleteDriver(${driver.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    renderTrips: function() {
        const tripList = document.getElementById('tripList');
        const filter = document.querySelector('input[name="tripFilter"]:checked').id;
        const today = new Date().toISOString().split('T')[0];
        
        let filteredTrips = this.trips;
        
        if (filter === 'todayTrips') {
            filteredTrips = this.trips.filter(trip => trip.date === today);
        } else if (filter === 'upcomingTrips') {
            filteredTrips = this.trips.filter(trip => trip.date >= today && trip.status === 'Scheduled');
        }
        
        tripList.innerHTML = filteredTrips.map(trip => `
            <tr>
                <td>${trip.tripId}</td>
                <td>${trip.route}</td>
                <td>${trip.driver}</td>
                <td>${trip.vehicle}</td>
                <td>${this.formatDate(trip.date)} ${trip.time}</td>
                <td><span class="badge-status ${this.getTripStatusClass(trip.status)}">${trip.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-nit-outline me-1" onclick="AppData.updateTripStatus(${trip.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AppData.deleteTrip(${trip.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    renderMaintenance: function() {
        const maintenanceList = document.getElementById('maintenanceList');
        const searchTerm = document.getElementById('searchMaintenance').value.toLowerCase();
        
        let filteredMaintenance = this.maintenance;
        if (searchTerm) {
            filteredMaintenance = this.maintenance.filter(record => 
                record.vehicle.toLowerCase().includes(searchTerm) ||
                record.type.toLowerCase().includes(searchTerm) ||
                record.description.toLowerCase().includes(searchTerm)
            );
        }
        
        maintenanceList.innerHTML = filteredMaintenance.map(record => `
            <tr>
                <td>${record.vehicle}</td>
                <td>${this.formatDate(record.date)}</td>
                <td>${record.type}</td>
                <td>${record.description}</td>
                <td>${this.formatCurrency(record.cost)}</td>
                <td>${this.formatDate(record.nextDate)}</td>
            </tr>
        `).join('');
    },
    
    renderRecentTrips: function() {
        const recentTripsTable = document.getElementById('recentTripsTable');
        const recentTrips = this.trips
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        recentTripsTable.innerHTML = recentTrips.map(trip => `
            <tr>
                <td>${trip.tripId}</td>
                <td>${trip.route}</td>
                <td>${trip.driver}</td>
                <td>${trip.vehicle}</td>
                <td>${this.formatDate(trip.date)}</td>
                <td><span class="badge-status ${this.getTripStatusClass(trip.status)}">${trip.status}</span></td>
            </tr>
        `).join('');
    },
    
    renderMonthlySummary: function() {
        const monthlySummary = document.getElementById('monthlySummary');
        // Mock monthly summary data
        const summaryData = [
            {month: 'October 2023', trips: 42, fuelCost: 4250000, maintenanceCost: 650000, operationalCost: 4900000, utilization: 78},
            {month: 'September 2023', trips: 38, fuelCost: 3980000, maintenanceCost: 420000, operationalCost: 4400000, utilization: 72},
            {month: 'August 2023', trips: 45, fuelCost: 4520000, maintenanceCost: 850000, operationalCost: 5370000, utilization: 81}
        ];
        
        monthlySummary.innerHTML = summaryData.map(item => `
            <tr>
                <td>${item.month}</td>
                <td>${item.trips}</td>
                <td>${this.formatCurrency(item.fuelCost)}</td>
                <td>${this.formatCurrency(item.maintenanceCost)}</td>
                <td>${this.formatCurrency(item.operationalCost)}</td>
                <td>${item.utilization}%</td>
            </tr>
        `).join('');
    },
    
    populateVehicleDropdowns: function() {
        const activeVehicles = this.vehicles.filter(v => v.status === 'Active');
        const vehicleOptions = activeVehicles.map(v => 
            `<option value="${v.plate}">${v.plate} (${v.model})</option>`
        ).join('');
        
        // Update all vehicle dropdowns
        const dropdowns = ['assignedVehicle', 'tripVehicle', 'maintenanceVehicle'];
        dropdowns.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                // Save current value
                const currentValue = select.value;
                // Update options
                select.innerHTML = `<option value="">Select Vehicle</option>${vehicleOptions}`;
                // Restore current value if it exists
                if (currentValue) {
                    select.value = currentValue;
                }
            }
        });
    },
    
    populateDriverDropdowns: function() {
        const activeDrivers = this.drivers.filter(d => d.status === 'Active');
        const driverOptions = activeDrivers.map(d => 
            `<option value="${d.name}">${d.name} (${d.license})</option>`
        ).join('');
        
        // Update driver dropdown
        const tripDriverSelect = document.getElementById('tripDriver');
        if (tripDriverSelect) {
            const currentValue = tripDriverSelect.value;
            tripDriverSelect.innerHTML = `<option value="">Select Driver</option>${driverOptions}`;
            if (currentValue) {
                tripDriverSelect.value = currentValue;
            }
        }
    },
    
    addVehicle: function(formData) {
        const newVehicle = {
            id: this.vehicles.length > 0 ? Math.max(...this.vehicles.map(v => v.id)) + 1 : 1,
            plate: formData.plateNumber,
            type: formData.vehicleType,
            model: formData.vehicleModel,
            year: parseInt(formData.manufactureYear),
            capacity: parseInt(formData.vehicleCapacity),
            status: formData.vehicleStatus
        };
        
        this.vehicles.push(newVehicle);
        this.saveData();
        this.renderVehicles();
        this.populateVehicleDropdowns();
        this.showAlert('Vehicle added successfully!', 'success');
    },
    
    addDriver: function(formData) {
        const newDriver = {
            id: this.drivers.length > 0 ? Math.max(...this.drivers.map(d => d.id)) + 1 : 1,
            name: formData.driverName,
            license: formData.licenseNumber,
            phone: formData.phoneNumber,
            experience: parseInt(formData.experience),
            assignedVehicle: formData.assignedVehicle,
            status: 'Active'
        };
        
        this.drivers.push(newDriver);
        this.saveData();
        this.renderDrivers();
        this.populateDriverDropdowns();
        this.showAlert('Driver added successfully!', 'success');
    },
    
    addTrip: function(formData) {
        const tripId = `TR-${new Date().getFullYear()}-${(this.trips.length + 1).toString().padStart(3, '0')}`;
        const newTrip = {
            id: this.trips.length > 0 ? Math.max(...this.trips.map(t => t.id)) + 1 : 1,
            tripId: tripId,
            route: formData.tripRoute,
            driver: formData.tripDriver,
            vehicle: formData.tripVehicle,
            date: formData.tripDate,
            time: formData.tripTime,
            fuel: parseInt(formData.fuelUsed),
            passengers: parseInt(formData.passengerCount),
            purpose: formData.tripPurpose,
            status: 'Scheduled'
        };
        
        this.trips.push(newTrip);
        this.saveData();
        this.renderTrips();
        this.renderRecentTrips();
        this.showAlert('Trip scheduled successfully!', 'success');
    },
    
    addMaintenance: function(formData) {
        const newMaintenance = {
            id: this.maintenance.length > 0 ? Math.max(...this.maintenance.map(m => m.id)) + 1 : 1,
            vehicle: formData.maintenanceVehicle,
            date: formData.serviceDate,
            type: formData.serviceType,
            description: formData.serviceDescription,
            cost: parseInt(formData.serviceCost),
            nextDate: formData.nextServiceDate
        };
        
        this.maintenance.push(newMaintenance);
        
        // Update vehicle status if under maintenance
        const vehicle = this.vehicles.find(v => v.plate === formData.maintenanceVehicle);
        if (vehicle && formData.serviceType.includes('Repair') || formData.serviceType.includes('Replacement')) {
            vehicle.status = 'Under Maintenance';
            this.saveData();
            this.renderVehicles();
            this.populateVehicleDropdowns();
        }
        
        this.saveData();
        this.renderMaintenance();
        this.showAlert('Service record added successfully!', 'success');
    },
    
    deleteVehicle: function(id) {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            const index = this.vehicles.findIndex(v => v.id === id);
            if (index !== -1) {
                this.vehicles.splice(index, 1);
                this.saveData();
                this.renderVehicles();
                this.populateVehicleDropdowns();
                this.showAlert('Vehicle deleted successfully!', 'warning');
            }
        }
    },
    
    deleteDriver: function(id) {
        if (confirm('Are you sure you want to delete this driver?')) {
            const index = this.drivers.findIndex(d => d.id === id);
            if (index !== -1) {
                this.drivers.splice(index, 1);
                this.saveData();
                this.renderDrivers();
                this.populateDriverDropdowns();
                this.showAlert('Driver deleted successfully!', 'warning');
            }
        }
    },
    
    deleteTrip: function(id) {
        if (confirm('Are you sure you want to delete this trip?')) {
            const index = this.trips.findIndex(t => t.id === id);
            if (index !== -1) {
                this.trips.splice(index, 1);
                this.saveData();
                this.renderTrips();
                this.renderRecentTrips();
                this.showAlert('Trip deleted successfully!', 'warning');
            }
        }
    },
    
    updateTripStatus: function(id) {
        const trip = this.trips.find(t => t.id === id);
        if (trip) {
            const newStatus = prompt(`Update trip status for ${trip.tripId} (Current: ${trip.status}):\nEnter: Scheduled, In Progress, Completed, or Cancelled`);
            if (newStatus && ['Scheduled', 'In Progress', 'Completed', 'Cancelled'].includes(newStatus)) {
                trip.status = newStatus;
                this.saveData();
                this.renderTrips();
                this.renderRecentTrips();
                this.showAlert('Trip status updated successfully!', 'info');
            }
        }
    },
    
    editVehicle: function(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (vehicle) {
            document.getElementById('plateNumber').value = vehicle.plate;
            document.getElementById('vehicleType').value = vehicle.type;
            document.getElementById('vehicleModel').value = vehicle.model;
            document.getElementById('manufactureYear').value = vehicle.year;
            document.getElementById('vehicleStatus').value = vehicle.status;
            document.getElementById('vehicleCapacity').value = vehicle.capacity;
            
            // Change form submit to update instead of add
            const form = document.getElementById('addVehicleForm');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Vehicle';
            
            // Store ID for updating
            form.dataset.editId = id;
            
            // Scroll to form
            document.getElementById('vehicles-tab').click();
            document.getElementById('addVehicleForm').scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    editDriver: function(id) {
        const driver = this.drivers.find(d => d.id === id);
        if (driver) {
            document.getElementById('driverName').value = driver.name;
            document.getElementById('licenseNumber').value = driver.license;
            document.getElementById('phoneNumber').value = driver.phone;
            document.getElementById('experience').value = driver.experience;
            document.getElementById('assignedVehicle').value = driver.assignedVehicle;
            
            // Change form submit to update instead of add
            const form = document.getElementById('addDriverForm');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Driver';
            
            // Store ID for updating
            form.dataset.editId = id;
            
            // Scroll to form
            document.getElementById('drivers-tab').click();
            document.getElementById('addDriverForm').scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    updateVehicle: function(id, formData) {
        const index = this.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            this.vehicles[index] = {
                ...this.vehicles[index],
                plate: formData.plateNumber,
                type: formData.vehicleType,
                model: formData.vehicleModel,
                year: parseInt(formData.manufactureYear),
                capacity: parseInt(formData.vehicleCapacity),
                status: formData.vehicleStatus
            };
            
            this.saveData();
            this.renderVehicles();
            this.populateVehicleDropdowns();
            this.showAlert('Vehicle updated successfully!', 'success');
        }
    },
    
    updateDriver: function(id, formData) {
        const index = this.drivers.findIndex(d => d.id === id);
        if (index !== -1) {
            this.drivers[index] = {
                ...this.drivers[index],
                name: formData.driverName,
                license: formData.licenseNumber,
                phone: formData.phoneNumber,
                experience: parseInt(formData.experience),
                assignedVehicle: formData.assignedVehicle
            };
            
            this.saveData();
            this.renderDrivers();
            this.populateDriverDropdowns();
            this.showAlert('Driver updated successfully!', 'success');
        }
    },
    
    getStatusClass: function(status) {
        switch(status) {
            case 'Active': return 'badge-active';
            case 'Under Maintenance': return 'badge-maintenance';
            case 'Inactive': return 'badge-danger';
            default: return 'badge-secondary';
        }
    },
    
    getTripStatusClass: function(status) {
        switch(status) {
            case 'Scheduled': return 'badge-trip';
            case 'In Progress': return 'badge-warning';
            case 'Completed': return 'badge-active';
            case 'Cancelled': return 'badge-danger';
            default: return 'badge-secondary';
        }
    },
    
    formatDate: function(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },
    
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0
        }).format(amount);
    },
    
    showAlert: function(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert-message');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-message`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    },
    
    exportData: function() {
        const data = {
            vehicles: this.vehicles,
            drivers: this.drivers,
            trips: this.trips,
            maintenance: this.maintenance,
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `itvms-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showAlert('Data exported successfully!', 'success');
    }
};
