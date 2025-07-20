const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection (Railway-compatible)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));




// PostgreSQL connection pool
/*const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'login_db', // Make sure this database exists
  password: 'Vaibhav@120147',
  port: 5433
});*/

// ✅ Add Patient
app.post('/patients', async (req, res) => {
  try {
    const {
      namePrefix, name, gender, age, dob,
      mobile, address
    } = req.body;

    const result = await pool.query(
      `INSERT INTO patients
        (name_prefix, name, gender, age, dob, mobile, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [namePrefix, name, gender, age, dob, mobile, address]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting patient:', err);
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

// ✅ Get All Patients
app.get('/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// ✅ Update Patient by ID
app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;
  const {
    namePrefix, name, gender, age, dob,
    mobile, address
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE patients SET
        name_prefix = $1,
        name = $2,
        gender = $3,
        age = $4,
        dob = $5,
        mobile = $6,
        address = $7
       WHERE id = $8 RETURNING *`,
      [namePrefix, name, gender, age, dob, mobile, address, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// ✅ Delete Patient by ID
app.delete('/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
// ✅ Save Prescription
app.post('/prescriptions', async (req, res) => {
  const {
    patientId, weight, complaints, diagnosis,
    medicine, time, dose, days, followUpInDays, visit_date
  } = req.body;

  try {
    const result = await pool.query(
     `INSERT INTO prescriptions 
  (patient_id, weight, complaints, diagnosis, medicine, time, dose, days, "followupindays", visit_date)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
 [
  patientId,
  weight,
  JSON.stringify(complaints),
  JSON.stringify(diagnosis),
  JSON.stringify(medicine),
  JSON.stringify([time]),   // wrap single string in array
  JSON.stringify([dose]),
  JSON.stringify([days]),
  Array.isArray(followUpInDays) ? followUpInDays[0] : followUpInDays,
  visit_date || new Date()  // fallback if undefined
]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting prescription:', err);
    res.status(500).json({ error: 'Failed to add prescription' });
  }
});
//Get compliants List
// 📌 Get complaints List
app.get('/complaints', async (req, res) => {
  try {
    const result = await pool.query('SELECT item FROM complaints');
    const items = result.rows.map(row => row.item);
    res.json(items);
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});
// 📌 Get Diagnosis List
app.get('/diagnosis', async (req, res) => {
  try {
    const result = await pool.query('SELECT item FROM diagnosis');
    const items = result.rows.map(row => row.item);
    res.json(items);
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    res.status(500).json({ error: 'Failed to fetch diagnosis' });
  }
});

// 📌 Get Medicines List
app.get('/medicines', async (req, res) => {
  try {
    const result = await pool.query('SELECT item FROM medicines');
    const items = result.rows.map(row => row.item);
    res.json(items);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// Save new complaint
app.post('/complaints', async (req, res) => {
  const { item } = req.body;
  try {
    await pool.query('INSERT INTO complaints (item) VALUES ($1)', [item]);
    res.status(201).json({ message: 'Complaint added' });
  } catch (err) {
    console.error('Error adding complaint:', err);
    res.status(500).json({ error: 'Failed to add complaint' });
  }
});

// Similarly add for diagnosis
app.post('/diagnosis', async (req, res) => {
  const { item } = req.body;
  try {
    await pool.query('INSERT INTO diagnosis (item) VALUES ($1)', [item]);
    res.status(201).json({ message: 'Diagnosis added' });
  } catch (err) {
    console.error('Error adding diagnosis:', err);
    res.status(500).json({ error: 'Failed to add diagnosis' });
  }
});

// And for medicine
app.post('/medicines', async (req, res) => {
  const { item } = req.body;
  try {
    await pool.query('INSERT INTO medicines (item) VALUES ($1)', [item]);
    res.status(201).json({ message: 'Medicine added' });
  } catch (err) {
    console.error('Error adding medicine:', err);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});
// Get prescription history by patient ID
app.get('/prescriptions/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY visit_date DESC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).send('Server error');
  }
  
});
// ✅ Add root route to confirm server is running
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

