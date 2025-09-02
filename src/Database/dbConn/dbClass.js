const { Pool } = require('pg');

class DBClass {
    constructor(config) {
        this.config = config;
        this.pool = new Pool({
            host: config.hostname,
            port: config.port,
            database: config.database,
            user: config.username,
            password: config.password,
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        });

        // Handle pool errors
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    async connection() {
        try {
            const client = await this.pool.connect();
            return client;
        } catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }

    pool() {
        return this.pool;
    }

    async query(text, params) {
        const client = await this.connection();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }

    async executeSQLFile(sqlContent) {
        try {
            await this.query(sqlContent);
            console.log('SQL file executed successfully');
        } catch (error) {
            console.error('Error executing SQL file:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = DBClass;


