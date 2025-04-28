const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
let db;
async function connectDB() {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',       // Change if needed
            password: '5526',       // Your MySQL password
            database: 'wstudent'  // Database name
        });

        console.log('Connected to MySQL');

        // Create table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL
            )
        `);
        console.log('Checked/Created users table');

    } catch (error) {
        console.error('Database connection error:', error);
    }
}
connectDB();

// ===== Routes =====

// Submit Form (Create)
app.post('/submit-form', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.json({ message: 'Form submitted successfully!', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting form' });
    }
});

// Get All Forms (Read)
app.get('/forms', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching forms' });
    }
});

// Update Form (Update)
app.put('/forms/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, message } = req.body;

    try {
        await db.execute(
            'UPDATE users SET name = ?, email = ?, message = ? WHERE id = ?',
            [name, email, message, id]
        );
        res.json({ message: 'Form updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating form' });
    }
});

// Delete Form (Delete)
app.delete('/forms/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Form deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting form' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
