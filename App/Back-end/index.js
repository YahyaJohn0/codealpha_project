const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,      // e.g., '127.0.0.1' or 'localhost'
    user: process.env.DB_USER,      // e.g., 'root'
    password: process.env.DB_PASSWORD, // e.g., 'your_password'
    database: process.env.DB_NAME    // e.g., 'auth_db'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Sign up
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (error) => {
            if (error) {
                console.error('Error registering user:', error);
                return res.status(500).json({ message: 'Error registering user.' });
            }
            res.status(201).json({ message: 'User registered successfully.' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.error('Error logging in:', error);
            return res.status(500).json({ message: 'Error logging in.' });
        }
        
        console.log('Login Results:', results); // Log the results for debugging

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log('Password Valid:', isPasswordValid); // Log whether password is valid

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
