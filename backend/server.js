import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static assets
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Initialize MySQL connection pool if MYSQL_URL (or PGDATABASE style fallback) is available
let pool = null;
const dbUrl = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;

if (dbUrl) {
    console.log("Database connection variable detected. Connecting to MySQL database...");
    try {
        pool = mysql.createPool(dbUrl);

        // Create leads table if not exists (MySQL syntax)
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                company_name VARCHAR(150),
                email VARCHAR(150) UNIQUE,
                phone VARCHAR(50),
                plan VARCHAR(100),
                password VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        pool.query(createTableQuery)
            .then(() => {
                console.log("Database table 'leads' is ready in MySQL.");
                // Safe migration: add password column if migrating existing table on Railway
                return pool.query("ALTER TABLE leads ADD COLUMN password VARCHAR(255) AFTER plan;");
            })
            .then(() => console.log("MySQL column 'password' verified/added."))
            .catch(err => {
                if (err.errno === 1060 || err.code === 'ER_DUP_FIELDNAME') {
                    // Ignore duplicate fieldname error
                } else {
                    console.error("Error setting up MySQL leads table:", err);
                }
            });
    } catch (err) {
        console.error("Error creating MySQL pool:", err);
    }
} else {
    console.log("No database environment variable detected. Running with in-memory fallback database.");
}

// In-memory fallback database list
const memoryLeads = [];

// API Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: '2GetherRewards Backend API connected',
        databaseConnected: pool !== null,
        databaseType: 'mysql'
    });
});

// Endpoint to store registration lead data
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, companyName, email, phone, plan, password } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido.' });
    }
    
    try {
        if (pool) {
            const insertQuery = `
                INSERT INTO leads (first_name, last_name, company_name, email, phone, plan, password)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    first_name = VALUES(first_name),
                    last_name = VALUES(last_name),
                    company_name = VALUES(company_name),
                    phone = VALUES(phone),
                    plan = VALUES(plan),
                    password = VALUES(password),
                    created_at = CURRENT_TIMESTAMP;
            `;
            await pool.query(insertQuery, [firstName, lastName, companyName, email, phone, plan, password]);
            
            // Retrieve the record to confirm details
            const [rows] = await pool.query("SELECT * FROM leads WHERE email = ? LIMIT 1;", [email]);
            return res.status(201).json({ success: true, lead: rows[0] });
        } else {
            // Fallback to memory
            const existingIndex = memoryLeads.findIndex(l => l.email === email);
            const lead = { firstName, lastName, companyName, email, phone, plan, password, createdAt: new Date() };
            if (existingIndex > -1) {
                memoryLeads[existingIndex] = lead;
            } else {
                memoryLeads.push(lead);
            }
            console.log("In-memory database updated:", memoryLeads);
            return res.status(201).json({ success: true, lead });
        }
    } catch (err) {
        console.error("Error processing registration:", err);
        return res.status(500).json({ error: 'Error interno en la base de datos.' });
    }
});

// Endpoint to retrieve registration lead list
app.get('/api/leads', async (req, res) => {
    try {
        if (pool) {
            const [rows] = await pool.query("SELECT * FROM leads ORDER BY created_at DESC;");
            return res.json(rows);
        } else {
            return res.json(memoryLeads);
        }
    } catch (err) {
        console.error("Error fetching leads:", err);
        return res.status(500).json({ error: 'Error al recuperar registros de la base de datos.' });
    }
});

// Fallback all other routes to frontend SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
