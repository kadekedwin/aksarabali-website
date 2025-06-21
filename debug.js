// debug.js - Test database connection
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabase() {
    console.log('🔍 Testing database connection...');
    
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'aksarabali',
        port: process.env.DB_PORT || 3306,
        charset: 'utf8mb4'
    };
    
    console.log('📋 Database config:', {
        host: dbConfig.host,
        user: dbConfig.user,
        database: dbConfig.database,
        port: dbConfig.port,
        hasPassword: !!dbConfig.password
    });
    
    try {
        // Test connection
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful');
        
        // Test if database exists
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📂 Available databases:', databases.map(db => db.Database));
        
        // Check if our database exists
        const dbExists = databases.some(db => db.Database === dbConfig.database);
        if (!dbExists) {
            console.log('❌ Database "aksarabali" does not exist!');
            console.log('🔧 Please create it first:');
            console.log('   CREATE DATABASE aksarabali CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
            await connection.end();
            return false;
        }
        
        // Test table
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Available tables:', tables);
        
        // Check if aksara_bali table exists
        const tableExists = tables.some(table => Object.values(table)[0] === 'aksara_bali');
        if (!tableExists) {
            console.log('❌ Table "aksara_bali" does not exist!');
            console.log('🔧 Creating table...');
            
            const createTableSQL = `
                CREATE TABLE aksara_bali (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nama VARCHAR(100) NOT NULL,
                    aksara_bali VARCHAR(10) NOT NULL,
                    kategori VARCHAR(50) NOT NULL,
                    latin VARCHAR(50) NOT NULL,
                    unicode_aksara VARCHAR(20) NOT NULL,
                    contoh_penggunaan TEXT,
                    deskripsi TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_nama (nama),
                    INDEX idx_kategori (kategori),
                    INDEX idx_latin (latin)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `;
            
            await connection.execute(createTableSQL);
            console.log('✅ Table created successfully');
        }
        
        // Check data
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM aksara_bali');
        console.log(`📊 Records in table: ${rows[0].count}`);
        
        if (rows[0].count === 0) {
            console.log('⚠️  No data in table. Inserting sample data...');
            await insertSampleData(connection);
        }
        
        await connection.end();
        console.log('✅ Database test completed successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('🔧 Common solutions:');
        console.error('   1. Make sure MySQL server is running');
        console.error('   2. Check database credentials in .env file');
        console.error('   3. Create database: CREATE DATABASE aksarabali;');
        console.error('   4. Check if user has proper permissions');
        return false;
    }
}

async function insertSampleData(connection) {
    const sampleData = [
        ['Aksara A', 'ᬅ', 'Aksara Suara', 'a', 'U+1B05', 'ada, api, aduh', 'Huruf vokal pertama dalam aksara Bali'],
        ['Aksara I', 'ᬇ', 'Aksara Suara', 'i', 'U+1B07', 'iri, ikan, indah', 'Huruf vokal I dalam aksara Bali'],
        ['Aksara U', 'ᬉ', 'Aksara Suara', 'u', 'U+1B09', 'ulu, udang, umah', 'Huruf vokal U dalam aksara Bali'],
        ['Aksara Ka', 'ᬓ', 'Aksara Wianjana', 'ka', 'U+1B13', 'kaki, kuda, kucing', 'Konsonan Ka dalam aksara Bali'],
        ['Aksara Ga', 'ᬕ', 'Aksara Wianjana', 'ga', 'U+1B15', 'gajah, gula, guru', 'Konsonan Ga dalam aksara Bali'],
        ['Aksara Na', 'ᬦ', 'Aksara Wianjana', 'na', 'U+1B26', 'nama, nasi, nano', 'Konsonan Na dalam aksara Bali'],
        ['Aksara Ma', 'ᬫ', 'Aksara Wianjana', 'ma', 'U+1B2B', 'mama, makan, mata', 'Konsonan Ma dalam aksara Bali'],
        ['Aksara Ya', 'ᬬ', 'Aksara Wianjana', 'ya', 'U+1B2C', 'yang, yakin, yoga', 'Konsonan Ya dalam aksara Bali'],
        ['Aksara Ra', 'ᬭ', 'Aksara Wianjana', 'ra', 'U+1B2D', 'raja, rasa, rumah', 'Konsonan Ra dalam aksara Bali'],
        ['Aksara La', 'ᬮ', 'Aksara Wianjana', 'la', 'U+1B2E', 'laut, lima, laki', 'Konsonan La dalam aksara Bali']
    ];

    const insertQuery = `
        INSERT INTO aksara_bali 
        (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const data of sampleData) {
        try {
            await connection.execute(insertQuery, data);
            console.log(`✅ Inserted: ${data[0]}`);
        } catch (error) {
            console.error(`❌ Failed to insert ${data[0]}:`, error.message);
        }
    }
    
    console.log('✅ Sample data insertion completed');
}

// Run the test
testDatabase().then(success => {
    if (success) {
        console.log('\n🎉 Database is ready! You can now start the server.');
    } else {
        console.log('\n❌ Please fix database issues before starting the server.');
    }
    process.exit(success ? 0 : 1);
});