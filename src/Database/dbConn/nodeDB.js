const DBClass = require('./dbClass.js');
const Config = require('../../config/index');

const {databaseConfig} = Config;
// Database configuration with proper environment variable handling
const config = {
    hostname: databaseConfig.hostname || 'localhost',
    password: databaseConfig.password || 'jet123ABC',
    database: databaseConfig.database || 'test1',
    port: parseInt(databaseConfig.port || '5432'),
    username: databaseConfig.username || 'postgres'
};

// Create database instance
const dbInstance = new DBClass(config);

module.exports = dbInstance;