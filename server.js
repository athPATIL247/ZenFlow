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

    // Query to find user by employee_id
    db.query('SELECT * FROM users WHERE employee_id = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Server error');
        if (results.length > 0) {
            const user = results[0];
            res.json({ employeeId: user.employee_id, role: user.role }); // Ensure employee_id is returned
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

app.post('/add-employee', (req, res) => {
    const { name, departmentId, position, salary, bankDetails, dateJoined } = req.body;

    //insert the new employee
    db.query('INSERT INTO employees (name, department_id, position, bank_details, date_joined) VALUES (?, ?, ?, ?, ?)', 
        [name, departmentId, position,bankDetails, dateJoined], 
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

// Check if attendance is already marked for the day
app.get('/check-attendance', (req, res) => {
    const { employeeId, date } = req.query;

    db.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employeeId, date], (err, results) => {
        if (err) return res.status(500).send('Server error');
        res.json({ attendanceMarked: results.length > 0 });
    });
});

app.post('/mark-attendance', (req, res) => {
    const { employeeId, date } = req.body;
    console.log(`Received Employee ID: ${employeeId}, Date: ${date}`); // Debug log

    db.query('INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)', [employeeId, date, 'Present'], (err, results) => {
        if (err) {
            console.error('Error marking attendance:', err);
            return res.status(500).send('Error marking attendance: ' + err.message);
        }
        console.log('Attendance marked successfully:', results);
        res.status(201).send('Attendance marked successfully');
    });
});

app.get('/get-attendance', (req, res) => {
    const { employeeId } = req.query;

    db.query(
        `SELECT e.name, a.date, a.status 
         FROM attendance a 
         JOIN employees e ON a.employee_id = e.id 
         WHERE a.employee_id = ?`, 
        [employeeId], 
        (err, results) => {
            if (err) {
                console.error('Error fetching attendance records:', err);
                return res.status(500).send('Server error');
            }
            res.json(results);
        }
    );
});

app.get('/get-department', (req, res) => {
    const { employeeId } = req.query;

    db.query(
        `SELECT e.name, d.department_name 
         FROM employees e 
         JOIN departments d ON e.department_id = d.id 
         WHERE e.id = ?`, 
        [employeeId], 
        (err, results) => {
            if (err) {
                console.error('Error fetching department information:', err);
                return res.status(500).send('Server error');
            }
            if (results.length > 0) {
                res.json(results[0]); // Return the first result as JSON
            } else {
                res.status(404).send('Employee not found');
            }
        }
    );
});

// Handle salary payment insertion
app.post('/add-salary-payment', (req, res) => {
    console.log('🔥 API hit: /add-salary-payment'); 
    console.log('📩 Request Body:', req.body); // Check if data is received

    const { employeeId, baseSalary, payrollMonth, payrollYear } = req.body;

    if (!employeeId || !baseSalary || !payrollMonth || !payrollYear) {
        console.log('⚠️ Missing required fields');
        return res.status(400).send('All fields are required.');
    }

    const sql = 'INSERT INTO payroll (id, base_salary, payroll_month, payroll_year) VALUES (?, ?, ?, ?)';
    const values = [employeeId, baseSalary, payrollMonth, payrollYear];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('❌ DB Error:', err);
            return res.status(500).send('Database Error: ' + err.message);
        }
        console.log('✅ Salary inserted:', results);
        res.status(201).send('Salary payment recorded successfully');
    });
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



/*
TRIGGERS USED :

DELIMITER $$  -- Change delimiter to $$
CREATE TRIGGER calculate_totalDeductions
BEFORE INSERT ON payroll
FOR EACH ROW
BEGIN
    -- Calculate total deductions before inserting a new payroll record
    SET NEW.totalDeduction = NEW.income_tax + NEW.PF + NEW.LWP;
END $$  -- End of trigger definition
DELIMITER ;  -- Restore the default delimiter







DELIMITER $$

CREATE TRIGGER `calculate_LWP`
BEFORE INSERT ON `payroll`
FOR EACH ROW
BEGIN
    DECLARE absent_days INT;
    DECLARE total_days INT;

    -- Count the number of absent days for the employee in the specified payroll month and year
    SELECT COUNT(*) INTO absent_days
    FROM attendance
    WHERE employee_id = NEW.id 
      AND status = 'Absent'
      AND MONTH(date) = NEW.payroll_month
      AND YEAR(date) = NEW.payroll_year;

    -- Get the total number of days in the payroll month
    SELECT DAY(LAST_DAY(CONCAT(NEW.payroll_year, '-', NEW.payroll_month, '-01'))) INTO total_days;

    -- Calculate Loss of Pay (LWP) based on absent days and base salary
    SET NEW.LWP = absent_days * (NEW.base_salary / total_days);
END $$

DELIMITER ;







DELIMITER $$

CREATE TRIGGER `before_insert_update_payroll`
BEFORE INSERT ON `payroll`
FOR EACH ROW
BEGIN
    DECLARE total_days INT;
    DECLARE working_days INT;
    DECLARE absent_days INT;
    DECLARE is_leap_year BOOLEAN;
    DECLARE base_salary DECIMAL(10,2);

    -- Fetch the base salary of the employee if it exists
    SELECT base_salary INTO base_salary 
    FROM payroll 
    WHERE id = NEW.id 
    LIMIT 1;

    -- Determine if the payroll year is a leap year
    SET is_leap_year = 
        (NEW.payroll_year % 4 = 0 AND NEW.payroll_year % 100 <> 0) 
        OR (NEW.payroll_year % 400 = 0);

    -- Determine the number of days in the payroll month
    SET total_days =
        CASE
            WHEN NEW.payroll_month IN (1, 3, 5, 7, 8, 10, 12) THEN 31
            WHEN NEW.payroll_month IN (4, 6, 9, 11) THEN 30
            WHEN NEW.payroll_month = 2 AND is_leap_year THEN 29
            ELSE 28
        END;

    -- Count the number of working days (days marked as 'Present')
    SELECT COUNT(*) INTO working_days 
    FROM attendance
    WHERE employee_id = NEW.id
        AND MONTH(date) = NEW.payroll_month
        AND YEAR(date) = NEW.payroll_year
        AND status = 'Present';

    -- Calculate the number of absent days
    SET absent_days = total_days - working_days;

    -- If base salary is NULL, use the new base salary value
    IF base_salary IS NULL THEN
        SET base_salary = NEW.base_salary;
    END IF;

    -- Calculate Loss of Pay (LWP) deduction
    SET NEW.LWP = (absent_days * (base_salary / total_days));

    -- Calculate Income Tax (10% of base salary)
    SET NEW.income_tax = base_salary * 0.10;

    -- Calculate Provident Fund (12% of base salary)
    SET NEW.PF = base_salary * 0.12;

    -- Calculate total deductions (LWP + Income Tax + PF)
    SET NEW.totalDeduction = NEW.LWP + NEW.income_tax + NEW.PF;

END $$

DELIMITER ;

*/