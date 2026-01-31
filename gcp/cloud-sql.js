// Google Cloud SQL Configuration
// NIT University Dar es Salaam - PROJECT KALI ITVMS

const { Socket } = require('net');
const mysql = require('mysql2/promise');

class CloudSQLConnector {
    constructor() {
        this.pool = null;
        this.dbUser = process.env.DB_USER || 'root';
        this.dbPassword = process.env.DB_PASSWORD || '';
        this.dbName = process.env.DB_NAME || 'nit_vehicle_management';
        this.dbConnectionName = process.env.DB_CONNECTION_NAME;
        this.instanceHost = process.env.INSTANCE_HOST;
        this.dbPort = process.env.DB_PORT || 3306;
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    async createPool() {
        if (this.pool) {
            return this.pool;
        }

        const config = {
            user: this.dbUser,
            password: this.dbPassword,
            database: this.dbName,
            connectionLimit: 10,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            charset: 'utf8mb4'
        };

        if (this.isProduction && this.dbConnectionName) {
            // Production: Connect via Unix socket
            config.socketPath = `/cloudsql/${this.dbConnectionName}`;
            console.log('Connecting to Cloud SQL via Unix socket:', this.dbConnectionName);
        } else if (this.instanceHost) {
            // Development/Testing: Connect via TCP
            config.host = this.instanceHost;
            config.port = this.dbPort;
            console.log('Connecting to Cloud SQL via TCP:', `${this.instanceHost}:${this.dbPort}`);
        } else {
            // Local development
            config.host = process.env.DB_HOST || 'localhost';
            config.port = this.dbPort;
            console.log('Connecting to local MySQL:', `${config.host}:${config.port}`);
        }

        this.pool = mysql.createPool(config);

        // Test the connection
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('✅ Database connection established successfully');
        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            throw error;
        }

        return this.pool;
    }

    async closePool() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('Database connection pool closed');
        }
    }

    async executeQuery(query, params = []) {
        if (!this.pool) {
            await this.createPool();
        }

        try {
            const [rows] = await this.pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    async getConnection() {
        if (!this.pool) {
            await this.createPool();
        }
        return this.pool.getConnection();
    }
}

module.exports = new CloudSQLConnector();
