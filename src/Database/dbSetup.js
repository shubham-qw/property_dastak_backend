const fs = require('fs');
const path = require('path');
const DBClass = require('./dbConn/dbClass');

// Database configuration
const dbConfig = {
    hostname: process.env.DB_HOST || 'jupiter.x2ff.com',
    password: process.env.DB_PASSWORD || 'tracking',
    database: process.env.DB_NAME || 'test1',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres'
};

// Function to read SQL files from schema directory
function readSQLFiles(schemaDir) {
    const sqlFiles = [];
    const files = fs.readdirSync(schemaDir);
    
    files.forEach(file => {
        if (file.endsWith('.sql')) {
            const filePath = path.join(schemaDir, file);
            const sqlContent = fs.readFileSync(filePath, 'utf8');
            sqlFiles.push({
                filename: file,
                content: sqlContent
            });
        }
    });
    
    return sqlFiles;
}

// Function to setup database
async function setupDatabase() {
    const db = new DBClass(dbConfig);
    
    try {
        console.log('Connecting to database...');
        
        // Test connection
        await db.query('SELECT NOW()');
        console.log('Database connection successful!');
        
        // Read all SQL files from schema directory
        const schemaDir = path.join(__dirname, 'schema');
        const sqlFiles = readSQLFiles(schemaDir);
        
        console.log(`Found ${sqlFiles.length} SQL files to execute:`);
        
        // Execute each SQL file
        for (const sqlFile of sqlFiles) {
            console.log(`Executing ${sqlFile.filename}...`);
            try {
                await db.executeSQLFile(sqlFile.content);
                console.log(`✓ ${sqlFile.filename} executed successfully`);
            } catch (error) {
                console.log(sqlFile.filename);
                console.error(`✗ Error executing ${sqlFile.filename}:`, error.message);
                // Continue with other files even if one fails
            }
        }

        // Insert sample data if sample_data.sql exists
        const sampleDataPath = path.join(__dirname, 'schema', 'sample_data.sql');
        if (fs.existsSync(sampleDataPath)) {
            console.log('Inserting sample data...');
            try {
                const sampleDataContent = fs.readFileSync(sampleDataPath, 'utf8');
                await db.executeSQLFile(sampleDataContent);
                console.log('✓ Sample data inserted successfully');
            } catch (error) {
                console.error('✗ Error inserting sample data:', error.message);
            }
        }
        
        console.log('Database setup completed!');
        
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Function to run setup
async function runSetup() {
    try {
        await setupDatabase();
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

// Export functions for use in other modules
module.exports = {
    setupDatabase,
    readSQLFiles,
    dbConfig
};

// Run setup if this file is executed directly
if (require.main === module) {
    runSetup();
}
