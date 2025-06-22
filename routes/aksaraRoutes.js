const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const db = require('../config/database');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../3d');
        if (!fsSync.existsSync(uploadDir)) fsSync.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileName = req.body.nama 
            ? `${req.body.nama}.obj` 
            : `aksara_${Date.now()}.obj`;
        cb(null, fileName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

router.get('/', async (req, res) => {
    try {
        const connection = db.getConnection();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;
        const kategori = req.query.kategori;

        // Using connection.query instead of execute
        let query, countQuery, queryParams = [];
        
        if (kategori) {
            query = 'SELECT * FROM aksara_bali WHERE kategori = ? ORDER BY id LIMIT ? OFFSET ?';
            countQuery = 'SELECT COUNT(*) as total FROM aksara_bali WHERE kategori = ?';
            queryParams = [kategori, limit, offset];
            countParams = [kategori];
        } else {
            query = 'SELECT * FROM aksara_bali ORDER BY id LIMIT ? OFFSET ?';
            countQuery = 'SELECT COUNT(*) as total FROM aksara_bali';
            queryParams = [limit, offset];
            countParams = [];
        }
        
        const [rows] = await connection.query(query, queryParams);
        const [countResult] = await connection.query(countQuery, countParams);
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Check for 3D models availability - simplified
        for (const row of rows) {
            try {
                const modelPath = path.join(__dirname, '../3d', `${row.nama}.obj`);
                row.has_model = await fileExists(modelPath);
            } catch {
                row.has_model = false;
            }
        }

        res.json({
            success: true,
            message: 'Aksara retrieved successfully',
            data: rows,
            pagination: {
                page, limit, total, totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error in GET /:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const connection = db.getConnection();
        const searchQuery = req.query.q;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const kategori = req.query.kategori;
        const offset = (page - 1) * limit;

        if (!searchQuery || searchQuery.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const searchTerm = `%${searchQuery}%`;
        let query, countQuery, queryParams;
        
        if (kategori) {
            query = `
                SELECT * FROM aksara_bali 
                WHERE (nama LIKE ? OR latin LIKE ? OR deskripsi LIKE ? 
                OR contoh_penggunaan LIKE ? OR aksara_bali LIKE ?)
                AND kategori = ?
                ORDER BY nama
                LIMIT ? OFFSET ?
            `;
            countQuery = `
                SELECT COUNT(*) as total FROM aksara_bali 
                WHERE (nama LIKE ? OR latin LIKE ? OR deskripsi LIKE ? 
                OR contoh_penggunaan LIKE ? OR aksara_bali LIKE ?)
                AND kategori = ?
            `;
            queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, kategori, limit, offset];
            countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, kategori];
        } else {
            query = `
                SELECT * FROM aksara_bali 
                WHERE nama LIKE ? OR latin LIKE ? OR deskripsi LIKE ? 
                OR contoh_penggunaan LIKE ? OR aksara_bali LIKE ?
                ORDER BY nama
                LIMIT ? OFFSET ?
            `;
            countQuery = `
                SELECT COUNT(*) as total FROM aksara_bali 
                WHERE nama LIKE ? OR latin LIKE ? OR deskripsi LIKE ? 
                OR contoh_penggunaan LIKE ? OR aksara_bali LIKE ?
            `;
            queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset];
            countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
        }
        
        const [rows] = await connection.query(query, queryParams);
        const [countResult] = await connection.query(countQuery, countParams);
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Add 3D model info
        for (const row of rows) {
            try {
                const modelPath = path.join(__dirname, '../3d', `${row.nama}.obj`);
                row.has_model = await fileExists(modelPath);
            } catch {
                row.has_model = false;
            }
        }

        res.json({
            success: true,
            message: 'Search completed successfully',
            data: rows,
            searchQuery,
            pagination: {
                page, limit, total, totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error in GET /search:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const connection = db.getConnection();
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        const [rows] = await connection.query('SELECT * FROM aksara_bali WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aksara not found'
            });
        }

        const aksara = rows[0];
        
        try {
            const modelPath = path.join(__dirname, '../3d', `${aksara.nama}.obj`);
            aksara.has_model = await fileExists(modelPath);
        } catch {
            aksara.has_model = false;
        }

        res.json({
            success: true,
            message: 'Aksara retrieved successfully',
            data: aksara
        });
    } catch (error) {
        console.error('Error in GET /:id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', upload.single('model_file'), async (req, res) => {
    try {
        const connection = db.getConnection();
        const { nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi } = req.body;

        if (!nama || !aksara_bali || !kategori || !latin) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: nama, aksara_bali, kategori, latin'
            });
        }

        const query = `
            INSERT INTO aksara_bali 
            (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            nama, aksara_bali, kategori, latin, 
            unicode_aksara || '', contoh_penggunaan || null, deskripsi || null
        ];

        try {
            const [result] = await connection.query(query, params);
            const fileUploaded = req.file ? true : false;
            
            res.status(201).json({
                success: true,
                message: 'Aksara created successfully' + (fileUploaded ? ' with 3D model' : ''),
                data: { id: result.insertId, has_model: fileUploaded }
            });
        } catch (dbErr) {
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch {}
            }
            throw dbErr;
        }
    } catch (error) {
        console.error('Error in POST /:', error);
        res.status(500).json({ success: false, message: `Upload failed: ${error.message}` });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const connection = db.getConnection();
        const id = parseInt(req.params.id);
        const { nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        const [rows] = await connection.query('SELECT * FROM aksara_bali WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aksara not found'
            });
        }

        const oldNama = rows[0].nama;

        const [result] = await connection.query(`
            UPDATE aksara_bali 
            SET nama = ?, 
                aksara_bali = ?, 
                kategori = ?, 
                latin = ?, 
                unicode_aksara = ?, 
                contoh_penggunaan = ?, 
                deskripsi = ?
            WHERE id = ?
        `, [nama, aksara_bali, kategori, latin, unicode_aksara || '', contoh_penggunaan, deskripsi, id]);

        if (nama !== oldNama) {
            const oldPath = path.join(__dirname, '../3d', `${oldNama}.obj`);
            const newPath = path.join(__dirname, '../3d', `${nama}.obj`);
            
            try {
                if (await fileExists(oldPath)) {
                    await fs.rename(oldPath, newPath);
                }
            } catch {}
        }

        res.json({
            success: true,
            message: 'Aksara updated successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error in PUT /:id:', error);
        res.status(500).json({ success: false, message: `Update failed: ${error.message}` });
    }
});

router.post('/:id/model', async (req, res) => {
    try {
        const connection = db.getConnection();
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        // First get the aksara name
        const [rows] = await connection.query('SELECT nama FROM aksara_bali WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aksara not found'
            });
        }

        const aksaraNama = rows[0].nama;
        
        // Create a custom upload middleware with the filename based on aksara name
        const aksaraStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = path.join(__dirname, '../3d');
                if (!fsSync.existsSync(uploadDir)) fsSync.mkdirSync(uploadDir, { recursive: true });
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const fileName = `${aksaraNama}.obj`;
                cb(null, fileName);
            }
        });

        const aksaraUpload = multer({ 
            storage: aksaraStorage,
            limits: { fileSize: 10 * 1024 * 1024 }
        }).single('model_file');

        // Process the upload
        aksaraUpload(req, res, async function(err) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            }
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No model file uploaded'
                });
            }

            res.json({
                success: true,
                message: '3D model uploaded successfully',
                file: req.file.filename
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Model upload failed: ${error.message}`
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const connection = db.getConnection();
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        const [aksaraRows] = await connection.query('SELECT nama FROM aksara_bali WHERE id = ?', [id]);

        if (aksaraRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aksara not found'
            });
        }

        const aksaraNama = aksaraRows[0].nama;
        
        const [result] = await connection.query('DELETE FROM aksara_bali WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aksara not found or already deleted'
            });
        }

        const modelPath = path.join(__dirname, '../3d', `${aksaraNama}.obj`);
        
        try {
            if (await fileExists(modelPath)) {
                await fs.unlink(modelPath);
            }
        } catch {}

        res.json({
            success: true,
            message: 'Aksara deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /:id:', error);
        res.status(500).json({ success: false, message: `Delete failed: ${error.message}` });
    }
});

module.exports = router;