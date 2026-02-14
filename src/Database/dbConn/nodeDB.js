const DBClass = require('./dbClass.js');
const Config = require('../../config/index');

const {databaseConfig} = Config;
// Database configuration with proper environment variable handling
const config = {
    hostname: databaseConfig.hostname,
    password: databaseConfig.password,
    database: databaseConfig.database,
    port: parseInt(databaseConfig.port),
    username: databaseConfig.username
};

// Create database instance
const dbInstance = new DBClass(config);

module.exports = dbInstance;