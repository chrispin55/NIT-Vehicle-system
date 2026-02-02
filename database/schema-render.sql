-- NIT University Integrated Transport & Vehicle Management System Database Schema
-- Optimized for Render PostgreSQL deployment
-- Created for PROJECT KALI - ITVMS

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'driver', 'staff')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van')),
    model VARCHAR(100) NOT NULL,
    manufacture_year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Under Maintenance', 'Inactive')),
    fuel_capacity DECIMAL(8,2),
    current_fuel DECIMAL(8,2) DEFAULT 0,
    mileage DECIMAL(10,2) DEFAULT 0,
    last_service_date DATE,
    next_service_date DATE,
    insurance_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for vehicles table
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_service ON vehicles(next_service_date);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    date_of_birth DATE,
    hire_date DATE,
    license_expiry DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
    experience_years INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for drivers table
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    trip_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    purpose TEXT,
    distance_km DECIMAL(8,2),
    fuel_consumed DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for trips table
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- Maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    mechanic_name VARCHAR(100),
    parts_replaced TEXT,
    odometer_reading DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for maintenance table
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);

-- Fuel records table
CREATE TABLE IF NOT EXISTS fuel_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    fuel_date DATE NOT NULL,
    fuel_type VARCHAR(50) DEFAULT 'Petrol' CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric')),
    quantity_liters DECIMAL(8,2) NOT NULL,
    cost_per_liter DECIMAL(8,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    odometer_reading DECIMAL(10,2),
    fuel_station VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fuel records table
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date ON fuel_records(fuel_date);

-- Insert sample data for demo purposes
-- Insert sample users
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@nit.ac.tz', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'System Administrator', 'admin'),
('manager', 'manager@nit.ac.tz', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Transport Manager', 'manager'),
('driver1', 'driver1@nit.ac.tz', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'John Mwambene', 'driver'),
('driver2', 'driver2@nit.ac.tz', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Sarah Juma', 'driver');

-- Insert sample vehicles
INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status, fuel_capacity) VALUES
('NIT-001', 'SUV', 'Toyota Land Cruiser', 2022, 'Active', 80.0),
('NIT-002', 'Minibus', 'Toyota Hiace', 2021, 'Active', 60.0),
('NIT-003', 'Sedan', 'Toyota Corolla', 2023, 'Active', 50.0),
('NIT-004', 'Bus', 'Scania K360', 2020, 'Under Maintenance', 200.0);

-- Insert sample drivers
INSERT INTO drivers (full_name, license_number, phone, email, experience_years) VALUES
('John Mwambene', 'DL-123456', '+255712345678', 'john@nit.ac.tz', 8),
('Sarah Juma', 'DL-234567', '+255712345679', 'sarah@nit.ac.tz', 5),
('Robert Kimambo', 'DL-345678', '+255712345680', 'robert@nit.ac.tz', 12),
('Grace Mwangi', 'DL-456789', '+255712345681', 'grace@nit.ac.tz', 3);

-- Insert sample trips
INSERT INTO trips (vehicle_id, driver_id, trip_date, start_time, origin, destination, purpose, status) VALUES
(1, 1, CURRENT_DATE, '08:00', 'NIT Campus', 'City Center', 'Official Meeting', 'Completed'),
(2, 2, CURRENT_DATE, '09:00', 'NIT Campus', 'Airport', 'Student Pickup', 'In Progress'),
(3, 3, CURRENT_DATE - 1, '14:00', 'NIT Campus', 'Kariakoo', 'Supply Collection', 'Completed');

-- Insert sample maintenance records
INSERT INTO maintenance (vehicle_id, maintenance_type, description, cost, maintenance_date, status) VALUES
(4, 'Major Service', 'Engine oil change, filter replacement, brake inspection', 150000.00, CURRENT_DATE - 7, 'Completed'),
(1, 'Routine Check', 'Tire rotation and alignment', 50000.00, CURRENT_DATE + 7, 'Scheduled');

-- Insert sample fuel records
INSERT INTO fuel_records (vehicle_id, fuel_date, quantity_liters, cost_per_liter, total_cost, odometer_reading) VALUES
(1, CURRENT_DATE - 2, 60.0, 2450.50, 147030.00, 15420.5),
(2, CURRENT_DATE - 1, 45.0, 2450.50, 110272.50, 12350.0),
(3, CURRENT_DATE, 35.0, 2450.50, 85767.50, 8750.0);

-- Create updated_at trigger function (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for active vehicles with maintenance info
CREATE OR REPLACE VIEW active_vehicles AS
SELECT 
    v.id,
    v.plate_number,
    v.vehicle_type,
    v.model,
    v.manufacture_year,
    v.status,
    v.next_service_date,
    COALESCE(lm.last_maintenance_date, 'Never') as last_maintenance_date
FROM vehicles v
LEFT JOIN (
    SELECT 
        vehicle_id, 
        MAX(maintenance_date) as last_maintenance_date
    FROM maintenance 
    WHERE status = 'Completed'
    GROUP BY vehicle_id
) lm ON v.id = lm.vehicle_id
WHERE v.status = 'Active';

-- Create view for driver statistics
CREATE OR REPLACE VIEW driver_statistics AS
SELECT 
    d.id,
    d.full_name,
    d.license_number,
    d.experience_years,
    COUNT(t.id) as total_trips,
    COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_trips,
    SUM(CASE WHEN t.status = 'Completed' THEN COALESCE(t.distance_km, 0) ELSE 0 END) as total_distance
FROM drivers d
LEFT JOIN trips t ON d.id = t.driver_id
GROUP BY d.id, d.full_name, d.license_number, d.experience_years;

-- Grant permissions (adjust as needed for your Render setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nit_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nit_user;

COMMIT;
