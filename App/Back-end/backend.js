// Required dependencies
const express = require('express');
const mysql = require('mysql2/promise');  // Using promise-based MySQL
const bcrypt = require('bcrypt');         // For password hashing
const cors = require('cors');

// Initialize express app
const app = express();
const PORT =  process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());  // For parsing JSON bodies

// Create MySQL connection pool
const db = mysql.createPool({
  host: '127.0.0.1',   // Your MySQL host (e.g., 'localhost')
  user: 'root',        // Your MySQL username (e.g., 'root')
  password: 'yahya',   // Your MySQL password
  database: 'Logindb', // Your MySQL database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Route for user registration (SignUp)
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    await db.query(query, [username, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in SignUp:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Route for user login
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch the user from the database by username
    const query = 'SELECT * FROM users WHERE username = ?';
    const [results] = await db.query(query, [username]);

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];
    
    // Compare the password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error in Login:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.get('/', (req, res) => {
  res.send('API is running...');
});


app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
