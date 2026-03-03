import DBClass, { dbConfig } from './dbClass';
import Config from '../../config';

const {databaseConfig} = Config;
// Database configuration with proper environment variable handling
const config: dbConfig = {
    hostname: databaseConfig.hostname || '',
    password: databaseConfig.password || '',
    database: databaseConfig.database || '',
    port: parseInt(databaseConfig.port || ''),
    username: databaseConfig.username || ''
};

// Create database instance
const dbInstance = new DBClass(config);

export default dbInstance;