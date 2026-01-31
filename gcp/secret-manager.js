// Google Cloud Secret Manager Configuration
// NIT University Dar es Salaam - PROJECT KALI ITVMS

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretManager {
    constructor() {
        this.client = null;
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'nit-vehicle-management';
        this.isProduction = process.env.NODE_ENV === 'production';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async initialize() {
        try {
            this.client = new SecretManagerServiceClient();
            console.log('✅ Secret Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Secret Manager:', error.message);
            throw error;
        }
    }

    async getSecret(secretName, useCache = true) {
        if (!this.client) {
            await this.initialize();
        }

        // Check cache first
        const cacheKey = `${this.projectId}/${secretName}`;
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.value;
            }
        }

        try {
            const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
            const [version] = await this.client.accessSecretVersion({ name });
            
            const secretValue = version.payload.data.toString('utf8');
            
            // Cache the secret
            this.cache.set(cacheKey, {
                value: secretValue,
                timestamp: Date.now()
            });

            console.log(`✅ Secret retrieved successfully: ${secretName}`);
            return secretValue;
        } catch (error) {
            console.error(`❌ Failed to retrieve secret ${secretName}:`, error.message);
            
            // In development, fall back to environment variables
            if (!this.isProduction) {
                const envValue = process.env[secretName.toUpperCase()];
                if (envValue) {
                    console.log(`⚠️ Using environment variable for ${secretName} in development`);
                    return envValue;
                }
            }
            
            throw error;
        }
    }

    async setSecret(secretName, secretValue) {
        if (!this.client) {
            await this.initialize();
        }

        try {
            const parent = `projects/${this.projectId}`;
            const [secret] = await this.client.createSecret({
                parent,
                secretId: secretName,
                secret: {
                    replication: {
                        automatic: {}
                    }
                }
            });

            const [version] = await this.client.addSecretVersion({
                parent: secret.name,
                payload: {
                    data: Buffer.from(secretValue, 'utf8')
                }
            });

            console.log(`✅ Secret created successfully: ${secretName}`);
            
            // Update cache
            const cacheKey = `${this.projectId}/${secretName}`;
            this.cache.set(cacheKey, {
                value: secretValue,
                timestamp: Date.now()
            });

            return version.name;
        } catch (error) {
            console.error(`❌ Failed to create secret ${secretName}:`, error.message);
            throw error;
        }
    }

    async updateSecret(secretName, secretValue) {
        if (!this.client) {
            await this.initialize();
        }

        try {
            const parent = `projects/${this.projectId}/secrets/${secretName}`;
            const [version] = await this.client.addSecretVersion({
                parent,
                payload: {
                    data: Buffer.from(secretValue, 'utf8')
                }
            });

            console.log(`✅ Secret updated successfully: ${secretName}`);
            
            // Update cache
            const cacheKey = `${this.projectId}/${secretName}`;
            this.cache.set(cacheKey, {
                value: secretValue,
                timestamp: Date.now()
            });

            return version.name;
        } catch (error) {
            console.error(`❌ Failed to update secret ${secretName}:`, error.message);
            throw error;
        }
    }

    async deleteSecret(secretName) {
        if (!this.client) {
            await this.initialize();
        }

        try {
            const name = `projects/${this.projectId}/secrets/${secretName}`;
            await this.client.deleteSecret({ name });
            
            // Remove from cache
            const cacheKey = `${this.projectId}/${secretName}`;
            this.cache.delete(cacheKey);

            console.log(`✅ Secret deleted successfully: ${secretName}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete secret ${secretName}:`, error.message);
            throw error;
        }
    }

    async listSecrets() {
        if (!this.client) {
            await this.initialize();
        }

        try {
            const [secrets] = await this.client.listSecrets({
                parent: `projects/${this.projectId}`
            });

            return secrets.map(secret => ({
                name: secret.name.split('/').pop(),
                createTime: secret.createTime,
                updateTime: secret.updateTime
            }));
        } catch (error) {
            console.error('❌ Failed to list secrets:', error.message);
            throw error;
        }
    }

    // Convenience method to load all application secrets
    async loadApplicationSecrets() {
        const requiredSecrets = [
            'db-password',
            'jwt-secret',
            'encryption-key',
            'api-key'
        ];

        const secrets = {};
        
        for (const secretName of requiredSecrets) {
            try {
                const value = await this.getSecret(secretName);
                secrets[secretName.replace(/-/g, '_')] = value;
            } catch (error) {
                console.warn(`⚠️ Could not load secret ${secretName}:`, error.message);
            }
        }

        return secrets;
    }

    // Method to initialize environment from secrets
    async initializeEnvironment() {
        if (!this.isProduction) {
            console.log('🔧 Skipping secret initialization in development mode');
            return;
        }

        try {
            const secrets = await this.loadApplicationSecrets();
            
            // Update process.env with secrets
            if (secrets.db_password) process.env.DB_PASSWORD = secrets.db_password;
            if (secrets.jwt_secret) process.env.JWT_SECRET = secrets.jwt_secret;
            if (secrets.encryption_key) process.env.ENCRYPTION_KEY = secrets.encryption_key;
            if (secrets.api_key) process.env.API_KEY = secrets.api_key;

            console.log('✅ Environment initialized from secrets successfully');
        } catch (error) {
            console.error('❌ Failed to initialize environment from secrets:', error.message);
            throw error;
        }
    }
}

module.exports = new SecretManager();
