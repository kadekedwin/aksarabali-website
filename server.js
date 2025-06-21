const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const db = require('./config/database');
const aksaraRoutes = require('./routes/aksaraRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/3d');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileName = req.body.nama 
            ? `${req.body.nama.replace(/[^a-zA-Z0-9]/g, '_')}.obj` 
            : `aksara_${Date.now()}.obj`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use('/api/aksara', aksaraRoutes);

app.get('/api/health', async (req, res) => {
    try {
        const connection = db.getConnection();
        if (!connection) await db.connectDB();
        await connection.query('SELECT 1');
        
        res.json({
            success: true,
            message: 'Server and database are healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const connection = db.getConnection();
        if (!connection) await db.connectDB();
        
        const [rows] = await connection.query(
            'SELECT DISTINCT kategori FROM aksara_bali WHERE kategori IS NOT NULL ORDER BY kategori'
        );

        res.json({
            success: true,
            message: 'Categories retrieved successfully',
            data: rows.map(row => row.kategori)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories',
            error: error.message
        });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const connection = db.getConnection();
        if (!connection) await db.connectDB();
        
        const [totalResult] = await connection.query('SELECT COUNT(*) as total FROM aksara_bali');
        
        let activeCount = totalResult[0].total;
        try {
            const [activeResult] = await connection.query("SELECT COUNT(*) as count FROM aksara_bali WHERE status = 'active'");
            activeCount = activeResult[0].count;
        } catch (e) {}
        
        const [categoryResult] = await connection.query(`
            SELECT kategori, COUNT(*) as count 
            FROM aksara_bali 
            WHERE kategori IS NOT NULL 
            GROUP BY kategori 
            ORDER BY count DESC
        `);

        let modelsCount = 0;
        const modelsDir = path.join(__dirname, 'public/3d');
        if (fs.existsSync(modelsDir)) {
            const files = fs.readdirSync(modelsDir);
            modelsCount = files.filter(file => file.endsWith('.obj')).length;
        }

        res.json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: {
                total: totalResult[0].total,
                activeCount: activeCount,
                byCategory: categoryResult,
                categories: categoryResult.map(cat => cat.kategori),
                modelsCount: modelsCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve statistics',
            error: error.message
        });
    }
});

app.get('/api/random', async (req, res) => {
    try {
        const connection = db.getConnection();
        if (!connection) await db.connectDB();
        
        const count = Math.min(20, Math.max(1, parseInt(req.query.count) || 5));
        const [rows] = await connection.query(`SELECT * FROM aksara_bali ORDER BY RAND() LIMIT ${count}`);

        res.json({
            success: true,
            message: 'Random aksara retrieved successfully',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve random aksara',
            error: error.message
        });
    }
});

app.get('/api/db-test', async (req, res) => {
    try {
        const connection = db.getConnection();
        if (!connection) {
            return res.status(500).json({
                success: false,
                message: "Database connection not available"
            });
        }
        
        const [rows] = await connection.query('SELECT 1+1 as result');
        const [versionResult] = await connection.query('SELECT version() as version');
        const [dbCheckResult] = await connection.query('SHOW TABLES');
        
        // Get the database schema for aksara_bali table
        const [tableSchema] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'aksara_bali'
            ORDER BY ORDINAL_POSITION
        `, [db.dbConfig.database]);
        
        res.json({
            success: true,
            message: 'Database connection test successful',
            data: {
                basicTest: rows[0].result,
                mysqlVersion: versionResult[0].version,
                tables: dbCheckResult.map(row => Object.values(row)[0]),
                aksaraBaliSchema: tableSchema
            },
            timestamp: new Date().toISOString(),
            user: 'kadekedwin'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: error.message,
            stack: error.stack
        });
    }
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        name: 'Aksara Bali Digital API',
        version: '1.0.0',
        description: 'RESTful API for Balinese script data',
        endpoints: {
            'GET /api/health': 'Health check',
            'GET /api/aksara': 'Get all aksara with pagination',
            'GET /api/aksara/search': 'Search aksara',
            'GET /api/aksara/:id': 'Get specific aksara by ID',
            'POST /api/aksara': 'Create a new aksara',
            'PUT /api/aksara/:id': 'Update an existing aksara',
            'DELETE /api/aksara/:id': 'Delete an aksara',
            'POST /api/aksara/:id/model': 'Upload a 3D model for an aksara',
            'GET /api/categories': 'Get all available categories',
            'GET /api/stats': 'Get database statistics',
            'GET /api/random': 'Get random aksara'
        },
        currentTime: '2025-06-21 09:06:50',
        user: 'kadekedwin'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'debug.html'));
});

app.get('/manage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manage.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        requestedEndpoint: req.originalUrl,
        availableEndpoints: 'GET /api for documentation'
    });
});

app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

async function startServer() {
    try {
        const dbConnected = await db.connectDB();
        
        if (!dbConnected) {
            console.error('❌ Cannot start server: Database connection failed');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`
🚀 Aksara Bali Digital Server Started Successfully!
📍 Local URL: http://localhost:${PORT}
📚 API Documentation: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health
⏰ Started at: ${new Date().toLocaleString()}
👤 Current User: kadekedwin
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    try {
        await db.closeConnection();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    try {
        await db.closeConnection();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();