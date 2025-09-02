import DBClass, { dbConfig } from './dbClass';

// Database configuration with proper environment variable handling
const config: dbConfig = {
    hostname: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'Admin@123',
    database: process.env.DB_NAME || 'property_dastak',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'admin'
};

// Create database instance
const dbInstance = new DBClass(config);

export default dbInstance;