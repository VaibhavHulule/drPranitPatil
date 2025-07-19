const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',         // your PostgreSQL username
  host: 'localhost',
  database: 'login_db',     // database name you created
  password: 'Vaibhav@120147',// your PostgreSQL password
  port: 5433
});

// Create the login table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS logins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255)
  );
`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('✅ Table "logins" is ready.');
  }
});

// Route to handle login form submission
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing email or password');
  }

  try {
    await pool.query(
      'INSERT INTO logins (email, password) VALUES ($1, $2)',
      [email, password]
    );
    res.status(200).send('Login saved successfully');
  } catch (err) {
    console.error('Error saving login:', err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
