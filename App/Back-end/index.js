const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: process.env.DB_HOST,    
    user: process.env.DB_USER,     
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME    
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// User registration endpoint
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

// User login endpoint
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
        
        console.log('Login Results:', results); 

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log('Password Valid:', isPasswordValid); 

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../my-app/build')));

// The "catchall" handler: for any request that doesn't match one above, send back the React app.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
