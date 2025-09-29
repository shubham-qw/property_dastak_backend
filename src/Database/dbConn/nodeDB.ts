import DBClass, { dbConfig } from './dbClass';

// Database configuration with proper environment variable handling
const config: dbConfig = {
    hostname: process.env.DB_HOST || 'jupiter.x2ff.com',
    password: process.env.DB_PASSWORD || 'tracking',
    database: process.env.DB_NAME || 'test1',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres'
};

// Create database instance
const dbInstance = new DBClass(config);

export default dbInstance;