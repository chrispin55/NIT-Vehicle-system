-- NIT University Integrated Transport & Vehicle Management System Database Schema
-- Created for Railway.app MySQL deployment

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nit_itvms;
USE nit_itvms;

-- Users table for authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'driver', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacture_year INT NOT NULL,
    status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    experience_years INT NOT NULL,
    assigned_vehicle_id INT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- Trips table
CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(20) UNIQUE NOT NULL,
    route TEXT NOT NULL,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    trip_date DATE NOT NULL,
    trip_time TIME NOT NULL,
    estimated_fuel_liters DECIMAL(6,2) NOT NULL,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Maintenance records table
CREATE TABLE maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    service_date DATE NOT NULL,
    service_type ENUM('Routine Maintenance', 'Oil Change', 'Brake Repair', 'Engine Repair', 'Tire Replacement', 'Other') NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    next_service_date DATE NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Fuel records table
CREATE TABLE fuel_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    trip_id INT NULL,
    fuel_date DATE NOT NULL,
    liters DECIMAL(6,2) NOT NULL,
    cost_per_liter DECIMAL(6,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    odometer_reading INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@nit.ac.tz', '$2a$10$example_hash', 'System Administrator', 'admin'),
('manager', 'manager@nit.ac.tz', '$2a$10$example_hash', 'Transport Manager', 'manager');

INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) VALUES
('T 123 ABC', 'Minibus', 'Toyota Hiace', 2021, 'Active'),
('T 456 DEF', 'SUV', 'Nissan Patrol', 2019, 'Under Maintenance'),
('T 789 GHI', 'SUV', 'Toyota Land Cruiser', 2022, 'Active');

INSERT INTO drivers (driver_id, full_name, license_number, experience_years, assigned_vehicle_id, status) VALUES
('DRV-001', 'John Mwambene', 'DL-123456', 8, 1, 'Active'),
('DRV-002', 'Sarah Juma', 'DL-234567', 5, 2, 'Active'),
('DRV-003', 'Robert Kimambo', 'DL-345678', 12, 3, 'Active');

INSERT INTO trips (trip_id, route, driver_id, vehicle_id, trip_date, trip_time, estimated_fuel_liters, status) VALUES
('TR-2023-045', 'NIT Campus → Julius Nyerere Airport', 1, 1, '2023-10-15', '08:00:00', 50.00, 'In Progress'),
('TR-2023-046', 'NIT Campus → City Center', 2, 2, '2023-10-16', '10:30:00', 35.00, 'Scheduled'),
('TR-2023-047', 'NIT Campus → Mlimani City', 3, 3, '2023-10-17', '14:00:00', 40.00, 'Scheduled');

INSERT INTO maintenance_records (vehicle_id, service_date, service_type, cost, next_service_date) VALUES
(2, '2023-10-10', 'Brake Repair', 350000.00, '2024-01-10'),
(1, '2023-10-05', 'Routine Maintenance', 180000.00, '2024-01-05'),
(3, '2023-09-28', 'Oil Change', 120000.00, '2023-12-28');
