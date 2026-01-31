-- NIT University Dar es Salaam - PROJECT KALI ITVMS
-- Database Initialization Script

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nit_vehicle_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nit_vehicle_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  full_name VARCHAR(100),
  role ENUM('admin', 'manager', 'driver', 'user') DEFAULT 'user',
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
  manufacture_year INT,
  capacity INT,
  status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
  fuel_type ENUM('Diesel', 'Petrol', 'Electric', 'Hybrid') DEFAULT 'Diesel',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  insurance_expiry DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  email VARCHAR(100),
  experience_years INT DEFAULT 0,
  license_expiry DATE,
  assigned_vehicle_id INT NULL,
  status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
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
  fuel_consumed DECIMAL(10,2),
  passenger_count INT DEFAULT 0,
  notes TEXT,
  status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  service_date DATE NOT NULL,
  service_type ENUM('Routine Maintenance', 'Oil Change', 'Brake Repair', 'Tire Replacement', 'Engine Repair') NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  mileage INT,
  next_service_date DATE,
  performed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Fuel records table
CREATE TABLE IF NOT EXISTS fuel_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  driver_id INT NOT NULL,
  fuel_date DATE NOT NULL,
  fuel_type ENUM('Diesel', 'Petrol', 'Electric', 'Hybrid') NOT NULL,
  quantity_liters DECIMAL(10,2) NOT NULL,
  cost_per_liter DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  mileage INT,
  fuel_station VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Insert default admin user (password: nit2023)
INSERT IGNORE INTO users (username, password, email, full_name, role) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@nit.ac.tz', 'System Administrator', 'admin');

-- Insert sample data (optional)
INSERT IGNORE INTO vehicles (plate_number, vehicle_type, model, manufacture_year, capacity) VALUES
('T 123 ABC', 'Bus', 'Toyota Coaster', 2020, 30),
('T 456 DEF', 'Minibus', 'Toyota Hiace', 2021, 15),
('T 789 GHI', 'SUV', 'Toyota Land Cruiser', 2019, 7);

INSERT IGNORE INTO drivers (full_name, license_number, phone_number, experience_years) VALUES
('John Mwambene', 'DL-123456', '255-789-456123', 5),
('Grace Joseph', 'DL-789012', '255-756-789012', 3),
('Michael Kimaro', 'DL-345678', '255-712-345678', 7);
