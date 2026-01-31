const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Define models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'driver', 'staff'),
    defaultValue: 'staff'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  plate_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  vehicle_type: {
    type: DataTypes.ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van'),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  manufacture_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Under Maintenance', 'Inactive'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'vehicles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  driver_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assigned_vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'drivers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trip_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  route: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  trip_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  trip_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  estimated_fuel_liters: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  }
}, {
  tableName: 'trips',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const MaintenanceRecord = sequelize.define('MaintenanceRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  service_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  service_type: {
    type: DataTypes.ENUM('Routine Maintenance', 'Oil Change', 'Brake Repair', 'Engine Repair', 'Tire Replacement', 'Other'),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  next_service_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'maintenance_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const FuelRecord = sequelize.define('FuelRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  trip_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fuel_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  liters: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false
  },
  cost_per_liter: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  odometer_reading: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'fuel_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Driver.belongsTo(Vehicle, { foreignKey: 'assigned_vehicle_id', as: 'assignedVehicle' });
Vehicle.hasMany(Driver, { foreignKey: 'assigned_vehicle_id', as: 'drivers' });

Trip.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
Driver.hasMany(Trip, { foreignKey: 'driver_id', as: 'trips' });
Vehicle.hasMany(Trip, { foreignKey: 'vehicle_id', as: 'trips' });

MaintenanceRecord.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
Vehicle.hasMany(MaintenanceRecord, { foreignKey: 'vehicle_id', as: 'maintenanceRecords' });

FuelRecord.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
FuelRecord.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });
Vehicle.hasMany(FuelRecord, { foreignKey: 'vehicle_id', as: 'fuelRecords' });
Trip.hasMany(FuelRecord, { foreignKey: 'trip_id', as: 'fuelRecords' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceRecord,
  FuelRecord
};
