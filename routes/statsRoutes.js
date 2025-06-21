const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');

// Get overall statistics
router.get('/', async (req, res) => {
    try {
        const connection = getConnection();
        
        // Total count
        const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM aksara_bali');
        
        // Count by category
        const [categoryResult] = await connection.execute(`
            SELECT kategori, COUNT(*) as count 
            FROM aksara_bali 
            WHERE kategori IS NOT NULL
            GROUP BY kategori 
            ORDER BY count DESC
        `);
        
        // Recent additions (last 30 days)
        const [recentResult] = await connection.execute(`
            SELECT COUNT(*) as recent 
            FROM aksara_bali 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        // Most recent entry
        const [latestResult] = await connection.execute(`
            SELECT nama, created_at 
            FROM aksara_bali 
            ORDER BY created_at DESC 
            LIMIT 1
        `);

        res.json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: {
                total: totalResult[0].total,
                byCategory: categoryResult,
                recentAdditions: recentResult[0].recent,
                latestEntry: latestResult[0] || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get random aksara
router.get('/random', async (req, res) => {
    try {
        const connection = getConnection();
        const count = Math.min(10, Math.max(1, parseInt(req.query.count) || 5));
        
        const [rows] = await connection.execute(`
            SELECT * FROM aksara_bali 
            ORDER BY RAND() 
            LIMIT ?
        `, [count]);

        res.json({
            success: true,
            message: 'Random aksara retrieved successfully',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;