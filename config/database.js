const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aksarabali3d',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4'
};

let connection;

async function connectDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database');
        console.log(`📊 Database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
        
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM aksara_bali');
        console.log(`📋 Total aksara in database: ${rows[0].count}`);
        
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('🔧 Please create database "aksarabali3d" first');
        }
        
        return false;
    }
}

function getConnection() {
    return connection;
}

async function closeConnection() {
    try {
        if (connection) {
            await connection.end();
            console.log('🔒 Database connection closed');
        }
    } catch (error) {
        console.error('❌ Error closing database connection:', error.message);
    }
}

module.exports = {
    connectDB,
    getConnection,
    closeConnection,
    dbConfig
};