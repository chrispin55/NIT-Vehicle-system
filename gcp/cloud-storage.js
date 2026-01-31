// Google Cloud Storage Configuration
// NIT University Dar es Salaam - PROJECT KALI ITVMS

const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs').promises;

class CloudStorageManager {
    constructor() {
        this.storage = null;
        this.bucket = null;
        this.bucketName = process.env.GCS_BUCKET_NAME || 'nit-vehicle-management-storage';
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    async initialize() {
        try {
            // Initialize Storage client
            if (this.isProduction) {
                // Production: Use default credentials (service account)
                this.storage = new Storage();
            } else {
                // Development: Use service account key file
                const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS || './gcp/service-account-key.json';
                this.storage = new Storage({ keyFilename });
            }

            // Get bucket reference
            this.bucket = this.storage.bucket(this.bucketName);
            
            // Test connection
            await this.bucket.exists();
            console.log('✅ Cloud Storage initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Cloud Storage:', error.message);
            throw error;
        }
    }

    async uploadFile(filePath, destination, metadata = {}) {
        if (!this.bucket) {
            await this.initialize();
        }

        try {
            const options = {
                destination,
                metadata: {
                    metadata: {
                        ...metadata,
                        uploadedAt: new Date().toISOString(),
                        uploadedBy: 'PROJECT KALI ITVMS'
                    }
                }
            };

            await this.bucket.upload(filePath, options);
            const file = this.bucket.file(destination);
            
            // Make file public if needed
            if (metadata.makePublic) {
                await file.makePublic();
            }

            console.log(`✅ File uploaded successfully: ${destination}`);
            return {
                success: true,
                fileName: destination,
                publicUrl: metadata.makePublic ? `https://storage.googleapis.com/${this.bucketName}/${destination}` : null
            };
        } catch (error) {
            console.error('❌ Failed to upload file:', error.message);
            throw error;
        }
    }

    async uploadBuffer(buffer, destination, contentType, metadata = {}) {
        if (!this.bucket) {
            await this.initialize();
        }

        try {
            const file = this.bucket.file(destination);
            
            const options = {
                metadata: {
                    contentType,
                    metadata: {
                        ...metadata,
                        uploadedAt: new Date().toISOString(),
                        uploadedBy: 'PROJECT KALI ITVMS'
                    }
                }
            };

            await file.save(buffer, options);

            if (metadata.makePublic) {
                await file.makePublic();
            }

            console.log(`✅ Buffer uploaded successfully: ${destination}`);
            return {
                success: true,
                fileName: destination,
                publicUrl: metadata.makePublic ? `https://storage.googleapis.com/${this.bucketName}/${destination}` : null
            };
        } catch (error) {
            console.error('❌ Failed to upload buffer:', error.message);
            throw error;
        }
    }

    async downloadFile(source, destination) {
        if (!this.bucket) {
            await this.initialize();
        }

        try {
            await this.bucket.file(source).download({ destination });
            console.log(`✅ File downloaded successfully: ${source} -> ${destination}`);
            return { success: true, destination };
        } catch (error) {
            console.error('❌ Failed to download file:', error.message);
            throw error;
        }
    }

    async deleteFile(fileName) {
        if (!this.bucket) {
            await this.initialize();
        }

        try {
            await this.bucket.file(fileName).delete();
            console.log(`✅ File deleted successfully: ${fileName}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to delete file:', error.message);
            throw error;
        }
    }

    async listFiles(prefix = '', maxResults = 100) {
        if (!this.bucket) {
            await this.initialize();
        }

        try {
            const [files] = await this.bucket.getFiles({
                prefix,
                maxResults
            });

            return files.map(file => ({
                name: file.name,
                size: file.metadata.size,
                updated: file.metadata.updated,
                contentType: file.metadata.contentType,
                publicUrl: `https://storage.googleapis.com/${this.bucketName}/${file.name}`
            }));
        } catch (error) {
            console.error('❌ Failed to list files:', error.message);
            throw error;
        }
    }

    async getSignedUrl(fileName, expiresIn = 3600, action = 'read') {
        if (!this.bucket) {
            await this.initialize();
        }

        try {
            const options = {
                version: 'v4',
                action: action === 'write' ? 'write' : 'read',
                expires: Date.now() + expiresIn * 1000
            };

            const [url] = await this.bucket.file(fileName).getSignedUrl(options);
            return url;
        } catch (error) {
            console.error('❌ Failed to generate signed URL:', error.message);
            throw error;
        }
    }

    // Backup database to Cloud Storage
    async backupDatabase(backupData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `backups/database-backup-${timestamp}.json`;

        try {
            const buffer = Buffer.from(JSON.stringify(backupData, null, 2));
            await this.uploadBuffer(buffer, fileName, 'application/json', {
                type: 'database-backup',
                version: '1.0.0'
            });

            return {
                success: true,
                fileName,
                backupDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Failed to backup database:', error.message);
            throw error;
        }
    }

    // Restore database from Cloud Storage
    async restoreDatabase(fileName) {
        try {
            const tempFile = `/tmp/${fileName}`;
            await this.downloadFile(fileName, tempFile);
            
            const backupData = JSON.parse(await fs.readFile(tempFile, 'utf8'));
            
            // Clean up temp file
            await fs.unlink(tempFile);
            
            return {
                success: true,
                data: backupData,
                restoredAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Failed to restore database:', error.message);
            throw error;
        }
    }
}

module.exports = new CloudStorageManager();
