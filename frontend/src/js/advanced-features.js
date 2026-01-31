// Advanced Interactive Features for NIT ITVMS
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Loading Advanced Features...');
    
    // Initialize all advanced features
    initializeAdvancedFeatures();
});

function initializeAdvancedFeatures() {
    // Data persistence with localStorage
    initializeDataPersistence();
    
    // Advanced search and filtering
    initializeAdvancedSearch();
    
    // Drag and drop functionality
    initializeDragAndDrop();
    
    // Keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Export functionality
    initializeExportFeatures();
    
    // Print functionality
    initializePrintFeatures();
    
    // Advanced notifications
    initializeAdvancedNotifications();
    
    // Data visualization enhancements
    initializeAdvancedCharts();
    
    // Real-time clock and date updates
    initializeRealTimeUpdates();
    
    // Form enhancements
    initializeAdvancedForms();
    
    // Table enhancements
    initializeAdvancedTables();
    
    // Modal enhancements
    initializeAdvancedModals();
    
    console.log('✅ Advanced Features Initialized');
}

// Data Persistence with localStorage
function initializeDataPersistence() {
    console.log('💾 Initializing Data Persistence...');
    
    // Save data to localStorage
    window.saveData = function(type, data) {
        try {
            const existingData = JSON.parse(localStorage.getItem(`nititvms_${type}`) || '[]');
            existingData.push(data);
            localStorage.setItem(`nititvms_${type}`, JSON.stringify(existingData));
            console.log(`💾 Saved ${type} data to localStorage`);
            return true;
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return false;
        }
    };
    
    // Load data from localStorage
    window.loadData = function(type) {
        try {
            const data = JSON.parse(localStorage.getItem(`nititvms_${type}`) || '[]');
            console.log(`📂 Loaded ${type} data from localStorage:`, data);
            return data;
        } catch (error) {
            console.error('❌ Error loading data:', error);
            return [];
        }
    };
    
    // Clear all data
    window.clearAllData = function() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('nititvms_'));
        keys.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ Cleared all NIT ITVMS data from localStorage');
        showAdvancedNotification('All data cleared successfully', 'info');
    };
    
    // Load saved data on page load
    loadPersistedData();
}

function loadPersistedData() {
    const vehicles = loadData('vehicles');
    const drivers = loadData('drivers');
    const trips = loadData('trips');
    const maintenance = loadData('maintenance');
    
    // Add saved data to tables
    vehicles.forEach(vehicle => addVehicleToTable(vehicle));
    drivers.forEach(driver => addDriverToTable(driver));
    trips.forEach(trip => addTripToTable(trip));
    maintenance.forEach(record => addMaintenanceToTable(record));
    
    console.log('📊 Loaded persisted data into tables');
}

// Advanced Search and Filtering
function initializeAdvancedSearch() {
    console.log('🔍 Initializing Advanced Search...');
    
    // Create advanced search interface
    const searchContainers = document.querySelectorAll('.table-responsive');
    searchContainers.forEach(container => {
        const table = container.querySelector('table');
        if (table) {
            addAdvancedSearchToTable(container, table);
        }
    });
}

function addAdvancedSearchToTable(container, table) {
    // Create search bar
    const searchDiv = document.createElement('div');
    searchDiv.className = 'mb-3';
    searchDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control advanced-search" placeholder="Search...">
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select filter-column">
                    <option value="all">All Columns</option>
                    ${Array.from(table.querySelectorAll('thead th')).map((th, index) => 
                        `<option value="${index}">${th.textContent.trim()}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="col-md-3">
                <button class="btn btn-outline-secondary clear-search">
                    <i class="fas fa-times"></i> Clear
                </button>
            </div>
        </div>
    `;
    
    container.insertBefore(searchDiv, table);
    
    // Add search functionality
    const searchInput = searchDiv.querySelector('.advanced-search');
    const filterSelect = searchDiv.querySelector('.filter-column');
    const clearButton = searchDiv.querySelector('.clear-search');
    
    searchInput.addEventListener('input', () => performAdvancedSearch(table, searchInput.value, filterSelect.value));
    filterSelect.addEventListener('change', () => performAdvancedSearch(table, searchInput.value, filterSelect.value));
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterSelect.value = 'all';
        performAdvancedSearch(table, '', 'all');
    });
}

function performAdvancedSearch(table, searchTerm, columnIndex) {
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        let shouldShow = false;
        
        if (columnIndex === 'all') {
            // Search all columns
            shouldShow = row.textContent.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
            // Search specific column
            const cell = row.cells[columnIndex];
            if (cell) {
                shouldShow = cell.textContent.toLowerCase().includes(searchTerm.toLowerCase());
            }
        }
        
        row.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    // Show search results count
    showSearchResults(table, visibleCount, rows.length);
}

function showSearchResults(table, visibleCount, totalCount) {
    let resultsDiv = table.parentElement.querySelector('.search-results');
    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results alert alert-info alert-sm mb-2';
        table.parentElement.insertBefore(resultsDiv, table);
    }
    
    if (visibleCount === totalCount) {
        resultsDiv.style.display = 'none';
    } else {
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `<i class="fas fa-info-circle"></i> Showing ${visibleCount} of ${totalCount} results`;
    }
}

// Drag and Drop Functionality
function initializeDragAndDrop() {
    console.log('🎯 Initializing Drag and Drop...');
    
    // Make table rows draggable
    document.querySelectorAll('tbody tr').forEach(row => {
        row.draggable = true;
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('drop', handleDrop);
        row.addEventListener('dragend', handleDragEnd);
    });
}

let draggedRow = null;

function handleDragStart(e) {
    draggedRow = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedRow !== this) {
        const parent = this.parentNode;
        const draggedIndex = Array.from(parent.children).indexOf(draggedRow);
        const targetIndex = Array.from(parent.children).indexOf(this);
        
        if (draggedIndex < targetIndex) {
            parent.insertBefore(draggedRow, this.nextSibling);
        } else {
            parent.insertBefore(draggedRow, this);
        }
        
        showAdvancedNotification('Row order updated', 'success');
    }
    
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '';
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    console.log('⌨️ Initializing Keyboard Shortcuts...');
    
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S: Save current form
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentForm();
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            focusFirstSearch();
        }
        
        // Ctrl/Cmd + N: New record (open first modal)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openFirstModal();
        }
        
        // Escape: Close all modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + E: Export data
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportCurrentData();
        }
        
        // Ctrl/Cmd + P: Print current view
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            printCurrentView();
        }
    });
    
    // Show keyboard shortcuts help
    addKeyboardShortcutsHelp();
}

function saveCurrentForm() {
    const activeForm = document.querySelector('.modal.show form') || document.querySelector('form');
    if (activeForm) {
        const submitBtn = activeForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.click();
        }
    }
}

function focusFirstSearch() {
    const firstSearch = document.querySelector('.advanced-search, input[type="search"]');
    if (firstSearch) {
        firstSearch.focus();
    }
}

function openFirstModal() {
    const firstModalBtn = document.querySelector('[data-bs-toggle="modal"]');
    if (firstModalBtn) {
        firstModalBtn.click();
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    });
}

function exportCurrentData() {
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
        exportTableData(activeTab.id);
    }
}

function printCurrentView() {
    window.print();
}

function addKeyboardShortcutsHelp() {
    const helpBtn = document.createElement('button');
    helpBtn.className = 'btn btn-outline-info btn-sm position-fixed';
    helpBtn.style.cssText = 'bottom: 20px; left: 20px; z-index: 1000;';
    helpBtn.innerHTML = '<i class="fas fa-keyboard"></i> Shortcuts';
    helpBtn.title = 'Keyboard Shortcuts';
    
    helpBtn.addEventListener('click', showKeyboardShortcutsModal);
    document.body.appendChild(helpBtn);
}

function showKeyboardShortcutsModal() {
    const modalHtml = `
        <div class="modal fade" id="keyboardShortcutsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Keyboard Shortcuts</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="list-group">
                            <div class="list-group-item">
                                <strong>Ctrl/Cmd + S</strong> - Save current form
                            </div>
                            <div class="list-group-item">
                                <strong>Ctrl/Cmd + F</strong> - Focus search
                            </div>
                            <div class="list-group-item">
                                <strong>Ctrl/Cmd + N</strong> - New record
                            </div>
                            <div class="list-group-item">
                                <strong>Ctrl/Cmd + E</strong> - Export data
                            </div>
                            <div class="list-group-item">
                                <strong>Ctrl/Cmd + P</strong> - Print current view
                            </div>
                            <div class="list-group-item">
                                <strong>Escape</strong> - Close all modals
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('keyboardShortcutsModal'));
    modal.show();
}

// Export Functionality
function initializeExportFeatures() {
    console.log('📤 Initializing Export Features...');
    
    // Add export buttons to each table
    document.querySelectorAll('.table-responsive').forEach(container => {
        addExportButton(container);
    });
}

function addExportButton(container) {
    const exportDiv = document.createElement('div');
    exportDiv.className = 'mb-2';
    exportDiv.innerHTML = `
        <div class="btn-group" role="group">
            <button class="btn btn-outline-primary btn-sm export-csv" title="Export to CSV">
                <i class="fas fa-file-csv"></i> CSV
            </button>
            <button class="btn btn-outline-success btn-sm export-excel" title="Export to Excel">
                <i class="fas fa-file-excel"></i> Excel
            </button>
            <button class="btn btn-outline-info btn-sm export-json" title="Export to JSON">
                <i class="fas fa-file-code"></i> JSON
            </button>
        </div>
    `;
    
    container.insertBefore(exportDiv, container.firstChild);
    
    // Add export functionality
    exportDiv.querySelector('.export-csv').addEventListener('click', () => exportTableData(container, 'csv'));
    exportDiv.querySelector('.export-excel').addEventListener('click', () => exportTableData(container, 'excel'));
    exportDiv.querySelector('.export-json').addEventListener('click', () => exportTableData(container, 'json'));
}

function exportTableData(container, format) {
    const table = container.querySelector('table');
    const tableName = container.querySelector('h5, h4, h3')?.textContent || 'data';
    
    if (!table) return;
    
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
    );
    
    let content, filename, mimeType;
    
    switch (format) {
        case 'csv':
            content = [headers, ...rows].map(row => row.join(',')).join('\n');
            filename = `${tableName}.csv`;
            mimeType = 'text/csv';
            break;
        case 'json':
            content = JSON.stringify({ headers, rows }, null, 2);
            filename = `${tableName}.json`;
            mimeType = 'application/json';
            break;
        case 'excel':
            content = createExcelContent(headers, rows);
            filename = `${tableName}.xlsx`;
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
    }
    
    downloadFile(content, filename, mimeType);
    showAdvancedNotification(`Exported ${tableName} as ${format.toUpperCase()}`, 'success');
}

function createExcelContent(headers, rows) {
    // Simple Excel format (CSV that Excel can open)
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Print Functionality
function initializePrintFeatures() {
    console.log('🖨️ Initializing Print Features...');
    
    // Add print buttons
    document.querySelectorAll('.table-responsive').forEach(container => {
        addPrintButton(container);
    });
}

function addPrintButton(container) {
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-outline-secondary btn-sm mb-2 ms-2';
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print';
    printBtn.addEventListener('click', () => printTable(container));
    
    const existingBtn = container.querySelector('.btn-group');
    if (existingBtn) {
        existingBtn.parentElement.appendChild(printBtn);
    } else {
        container.insertBefore(printBtn, container.firstChild);
    }
}

function printTable(container) {
    const table = container.querySelector('table');
    const tableName = container.querySelector('h5, h4, h3')?.textContent || 'Table';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${tableName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h1 { color: #333; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <h1>${tableName}</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                ${table.outerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Advanced Notifications
function initializeAdvancedNotifications() {
    console.log('🔔 Initializing Advanced Notifications...');
    
    // Create notification container
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.cssText = 'z-index: 9999; max-width: 400px;';
        document.body.appendChild(container);
    }
}

window.showAdvancedNotification = function(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `toast show align-items-center text-white bg-${type === 'error' ? 'danger' : type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        notification.remove();
    }, duration);
};

// Advanced Charts
function initializeAdvancedCharts() {
    console.log('📊 Initializing Advanced Charts...');
    
    // Enhance existing charts
    enhanceVehicleStatusChart();
    enhanceMonthlyTripsChart();
    addFuelEfficiencyChart();
    addMaintenanceCostChart();
}

function enhanceVehicleStatusChart() {
    const ctx = document.getElementById('vehicleStatusChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Maintenance', 'Inactive', 'In Use'],
                datasets: [{
                    data: [12, 2, 1, 3],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#17a2b8'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
}

function enhanceMonthlyTripsChart() {
    const ctx = document.getElementById('monthlyTripsChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Number of Trips',
                    data: [45, 52, 38, 65, 48, 72],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
}

function addFuelEfficiencyChart() {
    const chartContainer = document.querySelector('.row');
    if (chartContainer) {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'col-md-6 mb-4';
        chartDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Fuel Efficiency</h5>
                </div>
                <div class="card-body">
                    <canvas id="fuelEfficiencyChart"></canvas>
                </div>
            </div>
        `;
        chartContainer.appendChild(chartDiv);
        
        const ctx = document.getElementById('fuelEfficiencyChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['ABC-123', 'XYZ-789', 'DEF-456'],
                    datasets: [{
                        label: 'KM/L',
                        data: [12.5, 8.2, 15.3],
                        backgroundColor: ['#28a745', '#ffc107', '#17a2b8']
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
}

function addMaintenanceCostChart() {
    const chartContainer = document.querySelector('.row');
    if (chartContainer) {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'col-md-6 mb-4';
        chartDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Maintenance Costs</h5>
                </div>
                <div class="card-body">
                    <canvas id="maintenanceCostChart"></canvas>
                </div>
            </div>
        `;
        chartContainer.appendChild(chartDiv);
        
        const ctx = document.getElementById('maintenanceCostChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Oil Change', 'Brake Repair', 'Tire Service', 'Other'],
                    datasets: [{
                        data: [500, 800, 1200, 300],
                        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545']
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
    }
}

// Real-time Updates
function initializeRealTimeUpdates() {
    console.log('⏰ Initializing Real-time Updates...');
    
    // Update clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Update date displays
    updateDateDisplays();
    setInterval(updateDateDisplays, 60000); // Update every minute
}

function updateClock() {
    const clockElements = document.querySelectorAll('.current-time');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    clockElements.forEach(element => {
        element.textContent = timeString;
    });
    
    // Add clock to header if not exists
    if (!document.querySelector('.current-time')) {
        const header = document.querySelector('.navbar-brand');
        if (header) {
            const clock = document.createElement('span');
            clock.className = 'current-time ms-3';
            clock.textContent = timeString;
            header.appendChild(clock);
        }
    }
}

function updateDateDisplays() {
    const dateElements = document.querySelectorAll('.current-date');
    const now = new Date();
    const dateString = now.toLocaleDateString();
    
    dateElements.forEach(element => {
        element.textContent = dateString;
    });
}

// Advanced Forms
function initializeAdvancedForms() {
    console.log('📝 Initializing Advanced Forms...');
    
    // Add form validation
    document.querySelectorAll('form').forEach(form => {
        addAdvancedValidation(form);
    });
    
    // Add auto-save functionality
    document.querySelectorAll('form').forEach(form => {
        addAutoSave(form);
    });
}

function addAdvancedValidation(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.name && field.name.includes('phone') && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Update field styling
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        removeFieldError(field);
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    removeFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

function addAutoSave(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    const formId = form.id || 'form-' + Math.random().toString(36).substr(2, 9);
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const formData = new FormData(form);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            localStorage.setItem(`autosave_${formId}`, JSON.stringify(formDataObj));
        });
    });
    
    // Restore auto-saved data
    const savedData = localStorage.getItem(`autosave_${formId}`);
    if (savedData) {
        try {
            const formDataObj = JSON.parse(savedData);
            Object.keys(formDataObj).forEach(key => {
                const input = form.querySelector(`[name="${key}"], #${key}`);
                if (input) {
                    input.value = formDataObj[key];
                }
            });
        } catch (error) {
            console.error('Error restoring auto-saved data:', error);
        }
    }
}

// Advanced Tables
function initializeAdvancedTables() {
    console.log('📋 Initializing Advanced Tables...');
    
    document.querySelectorAll('table').forEach(table => {
        addTableFeatures(table);
    });
}

function addTableFeatures(table) {
    // Add sorting
    addTableSorting(table);
    
    // Add row selection
    addRowSelection(table);
    
    // Add bulk actions
    addBulkActions(table);
}

function addTableSorting(table) {
    const headers = table.querySelectorAll('thead th');
    
    headers.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.innerHTML += ' <i class="fas fa-sort ms-1"></i>';
        
        header.addEventListener('click', () => {
            sortTable(table, index);
        });
    });
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const isAscending = table.dataset.sortOrder !== 'asc';
    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';
    
    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        
        if (isAscending) {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    rows.forEach(row => tbody.appendChild(row));
    
    // Update sort icons
    const headers = table.querySelectorAll('thead th i');
    headers.forEach(icon => icon.className = 'fas fa-sort ms-1');
    headers[columnIndex].className = isAscending ? 'fas fa-sort-up ms-1' : 'fas fa-sort-down ms-1';
}

function addRowSelection(table) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    // Add checkbox column
    const headerRow = table.querySelector('thead tr');
    const checkboxHeader = document.createElement('th');
    checkboxHeader.innerHTML = '<input type="checkbox" class="select-all">';
    headerRow.insertBefore(checkboxHeader, headerRow.firstChild);
    
    // Add checkboxes to rows
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const checkboxCell = document.createElement('td');
        checkboxCell.innerHTML = '<input type="checkbox" class="row-select">';
        row.insertBefore(checkboxCell, row.firstChild);
    });
    
    // Select all functionality
    const selectAll = checkboxHeader.querySelector('.select-all');
    selectAll.addEventListener('change', function() {
        const rowCheckboxes = tbody.querySelectorAll('.row-select');
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBulkActions(table);
    });
    
    // Individual row selection
    tbody.addEventListener('change', function(e) {
        if (e.target.classList.contains('row-select')) {
            updateBulkActions(table);
        }
    });
}

function addBulkActions(table) {
    const container = table.closest('.table-responsive');
    if (!container) return;
    
    // Check if bulk actions already exist
    if (container.querySelector('.bulk-actions')) return;
    
    const bulkActions = document.createElement('div');
    bulkActions.className = 'bulk-actions mb-3';
    bulkActions.style.display = 'none';
    bulkActions.innerHTML = `
        <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary bulk-edit">
                <i class="fas fa-edit"></i> Edit Selected
            </button>
            <button class="btn btn-sm btn-outline-danger bulk-delete">
                <i class="fas fa-trash"></i> Delete Selected
            </button>
            <button class="btn btn-sm btn-outline-secondary bulk-export">
                <i class="fas fa-download"></i> Export Selected
            </button>
        </div>
        <span class="ms-3 text-muted">
            <span class="selected-count">0</span> items selected
        </span>
    `;
    
    container.insertBefore(bulkActions, container.firstChild);
    
    // Add event listeners
    bulkActions.querySelector('.bulk-edit').addEventListener('click', () => bulkEdit(table));
    bulkActions.querySelector('.bulk-delete').addEventListener('click', () => bulkDelete(table));
    bulkActions.querySelector('.bulk-export').addEventListener('click', () => bulkExport(table));
}

function updateBulkActions(table) {
    const tbody = table.querySelector('tbody');
    const selectedRows = tbody.querySelectorAll('.row-select:checked');
    const bulkActions = table.closest('.table-responsive').querySelector('.bulk-actions');
    const selectedCount = bulkActions.querySelector('.selected-count');
    
    selectedCount.textContent = selectedRows.length;
    bulkActions.style.display = selectedRows.length > 0 ? 'block' : 'none';
}

function bulkEdit(table) {
    const selectedRows = table.querySelectorAll('.row-select:checked');
    showAdvancedNotification(`Edit ${selectedRows.length} selected items`, 'info');
}

function bulkDelete(table) {
    const selectedRows = table.querySelectorAll('.row-select:checked');
    if (confirm(`Are you sure you want to delete ${selectedRows.length} items?`)) {
        selectedRows.forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.remove();
        });
        updateBulkActions(table);
        showAdvancedNotification(`Deleted ${selectedRows.length} items`, 'success');
    }
}

function bulkExport(table) {
    const selectedRows = table.querySelectorAll('.row-select:checked');
    showAdvancedNotification(`Export ${selectedRows.length} selected items`, 'info');
}

// Advanced Modals
function initializeAdvancedModals() {
    console.log('🪟 Initializing Advanced Modals...');
    
    // Add modal enhancements
    document.querySelectorAll('.modal').forEach(modal => {
        enhanceModal(modal);
    });
}

function enhanceModal(modal) {
    // Add maximize button
    const header = modal.querySelector('.modal-header');
    if (header && !header.querySelector('.modal-maximize')) {
        const maximizeBtn = document.createElement('button');
        maximizeBtn.className = 'btn btn-sm btn-outline-secondary modal-maximize';
        maximizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
        maximizeBtn.addEventListener('click', () => toggleModalMaximize(modal));
        header.appendChild(maximizeBtn);
    }
    
    // Add keyboard navigation
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Handle tab navigation within modal
            const focusableElements = modal.querySelectorAll('input, select, textarea, button, a');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

function toggleModalMaximize(modal) {
    const dialog = modal.querySelector('.modal-dialog');
    const maximizeBtn = modal.querySelector('.modal-maximize i');
    
    if (dialog.classList.contains('modal-fullscreen')) {
        dialog.classList.remove('modal-fullscreen');
        maximizeBtn.className = 'fas fa-expand';
    } else {
        dialog.classList.add('modal-fullscreen');
        maximizeBtn.className = 'fas fa-compress';
    }
}

console.log('🚀 Advanced Features Module Loaded Successfully!');
