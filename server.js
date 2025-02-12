import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

//connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'atharva@2005', 
    database: 'zenflow' 
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    //query to find user
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Server error');
        if (results.length === 0) return res.status(401).send('Invalid credentials');

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).send('Invalid credentials');
        }

        res.json({ message: 'Login successful', role: user.role });
    });
});

app.post('/add-employee', (req, res) => {
    const { name, departmentId, position, salary, bankDetails, dateJoined } = req.body;

    //insert the new employee
    db.query('INSERT INTO employees (name, department_id, position, salary, bank_details, date_joined) VALUES (?, ?, ?, ?, ?, ?)', 
        [name, departmentId, position, salary, bankDetails, dateJoined], 
        (err, results) => {
            if (err) {
                return res.status(500).send('Error adding employee: ' + err.message);
            }
            res.status(201).send('Employee added successfully');
        });
});

app.post('/remove-employee', (req, res) => {
    const { id } = req.body;

    db.query('DELETE FROM employees WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send('Error removing employee: ' + err.message);
        }
        res.send('Employee removed successfully');
    });
});

app.get('/view-employees', (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching employees: ' + err.message);
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});