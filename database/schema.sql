-- NIT University Vehicle Management System Database Schema
-- Created for PROJECT KALI - ITVMS

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nit_vehicle_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nit_vehicle_management;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'driver', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacture_year INT NOT NULL,
    capacity INT NOT NULL,
    status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
    fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid') DEFAULT 'Diesel',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    insurance_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plate_number (plate_number),
    INDEX idx_status (status),
    INDEX idx_vehicle_type (vehicle_type)
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    experience_years INT DEFAULT 0,
    license_expiry DATE,
    assigned_vehicle_id INT NULL,
    status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_license_number (license_number),
    INDEX idx_status (status),
    INDEX idx_assigned_vehicle (assigned_vehicle_id)
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_from VARCHAR(200) NOT NULL,
    route_to VARCHAR(200) NOT NULL,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    trip_date DATE NOT NULL,
    departure_time TIME,
    arrival_time TIME,
    distance_km DECIMAL(10,2),
    fuel_consumed DECIMAL(8,2),
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    passenger_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    INDEX idx_trip_date (trip_date),
    INDEX idx_status (status),
    INDEX idx_driver (driver_id),
    INDEX idx_vehicle (vehicle_id)
);

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    maintenance_type ENUM('Routine', 'Repair', 'Inspection') NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    mechanic_name VARCHAR(100),
    status ENUM('Scheduled', 'In Progress', 'Completed') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_maintenance (vehicle_id),
    INDEX idx_maintenance_date (maintenance_date),
    INDEX idx_status (status)
);

-- Fuel records table
CREATE TABLE IF NOT EXISTS fuel_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    fuel_date DATE NOT NULL,
    fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid') NOT NULL,
    quantity_liters DECIMAL(8,2),
    cost_per_liter DECIMAL(8,2),
    total_cost DECIMAL(10,2),
    odometer_reading INT,
    driver_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    INDEX idx_vehicle_fuel (vehicle_id),
    INDEX idx_fuel_date (fuel_date),
    INDEX idx_driver_fuel (driver_id)
);

-- Insert default admin user (password: nit2023)
INSERT IGNORE INTO users (username, password, email, full_name, role) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@nit.ac.tz', 'System Administrator', 'admin');

-- Insert sample data for demonstration
INSERT IGNORE INTO vehicles (plate_number, vehicle_type, model, manufacture_year, capacity, status) VALUES
('T 123 ABC', 'Bus', 'Toyota Coaster', 2020, 45, 'Active'),
('T 456 DEF', 'Minibus', 'Toyota Hiace', 2021, 15, 'Active'),
('T 789 GHI', 'SUV', 'Toyota Land Cruiser', 2019, 7, 'Active'),
('T 321 JKL', 'Sedan', 'Toyota Corolla', 2022, 4, 'Under Maintenance');

INSERT IGNORE INTO drivers (full_name, license_number, phone_number, experience_years, status) VALUES
('John Mwambene', 'DL-123456', '255-789-456123', 5, 'Active'),
('Mary Joseph', 'DL-789012', '255-756-789012', 3, 'Active'),
('Ali Hassan', 'DL-345678', '255-712-345678', 7, 'Active'),
('Grace Mbeki', 'DL-901234', '255-623-901234', 2, 'Active');
