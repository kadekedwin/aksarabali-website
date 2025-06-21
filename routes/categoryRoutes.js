const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(
            'SELECT DISTINCT kategori FROM aksara_bali WHERE kategori IS NOT NULL ORDER BY kategori'
        );

        const categories = rows.map(row => row.kategori);

        res.json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get category statistics
router.get('/stats', async (req, res) => {
    try {
        const connection = getConnection();
        const [rows] = await connection.execute(`
            SELECT kategori, COUNT(*) as count 
            FROM aksara_bali 
            WHERE kategori IS NOT NULL
            GROUP BY kategori 
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            message: 'Category statistics retrieved successfully',
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