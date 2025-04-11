import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

const app = express();
const PORT = 3001;

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
    console.log('👤 Login attempt:', { username });

    // Query to find user by employee_id AND password
    const query = 'SELECT * FROM users WHERE employee_id = ? AND password = ?';

    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const user = results[0];
            console.log('✅ Login successful:', user.employee_id);
            res.json({
                employeeId: user.employee_id,
                role: user.role
            });
        } else {
            console.log('❌ Invalid credentials for:', username);
            res.status(401).send('Invalid credentials');
        }
    });
});
app.post('/add-employee', (req, res) => {
    const { name, departmentId, position, dateJoined } = req.body;
    console.log('📝 Adding new employee:', { name, departmentId, position, dateJoined });

    //insert the new employee
    db.query('INSERT INTO employees (name, department_id, position, date_joined) VALUES (?, ?, ?, ?)',
        [name, departmentId, position, dateJoined],
        (err, results) => {
            if (err) {
                console.error('❌ Error adding employee:', err);
                return res.status(500).send('Error adding employee: ' + err.message);
            }
            console.log('✅ Employee added successfully:', results);
            res.status(201).send('Employee added successfully');
        });
});

app.post('/remove-employee', (req, res) => {
    const { id } = req.body;
    console.log('🗑️ Attempting to remove employee with ID:', id);

    if (!id) {
        console.log('⚠️ No employee ID provided');
        return res.status(400).send('Employee ID is required');
    }

    // First check if the employee exists
    db.query('SELECT id, name FROM employees WHERE id = ?', [id], (err, employeeResults) => {
        if (err) {
            console.error('❌ Error checking employee:', err);
            return res.status(500).send('Error checking employee: ' + err.message);
        }

        if (employeeResults.length === 0) {
            console.log('⚠️ Employee not found with ID:', id);
            return res.status(404).send('Employee not found');
        }

        const employeeName = employeeResults[0].name;
        console.log('✅ Found employee:', employeeName);

        // Start a transaction to ensure all related records are deleted
        db.beginTransaction(err => {
            if (err) {
                console.error('❌ Error starting transaction:', err);
                return res.status(500).send('Error starting transaction: ' + err.message);
            }

            // Delete from payroll (now using employee_id, not id)
            db.query('DELETE FROM payroll WHERE id = ?', [id], (err, payrollResults) => {
                if (err) {
                    console.error('❌ Error deleting payroll records:', err);
                    return db.rollback(() => {
                        res.status(500).send('Error deleting payroll records: ' + err.message);
                    });
                }
                console.log(`✅ Deleted ${payrollResults.affectedRows} payroll records`);

                // Delete from attendance
                db.query('DELETE FROM attendance WHERE employee_id = ?', [id], (err, attendanceResults) => {
                    if (err) {
                        console.error('❌ Error deleting attendance records:', err);
                        return db.rollback(() => {
                            res.status(500).send('Error deleting attendance records: ' + err.message);
                        });
                    }
                    console.log(`✅ Deleted ${attendanceResults.affectedRows} attendance records`);

                    // Delete from bankdetails
                    db.query('DELETE FROM bankdetails WHERE employee_id = ?', [id], (err, bankResults) => {
                        if (err) {
                            console.error('❌ Error deleting bank details:', err);
                            return db.rollback(() => {
                                res.status(500).send('Error deleting bank details: ' + err.message);
                            });
                        }
                        console.log(`✅ Deleted ${bankResults.affectedRows} bank details`);

                        // Delete from users
                        db.query('DELETE FROM users WHERE employee_id = ?', [id], (err, userResults) => {
                            if (err) {
                                console.error('❌ Error deleting user account:', err);
                                return db.rollback(() => {
                                    res.status(500).send('Error deleting user account: ' + err.message);
                                });
                            }
                            console.log(`✅ Deleted ${userResults.affectedRows} user account`);

                            // Delete the employee
                            db.query('DELETE FROM employees WHERE id = ?', [id], (err, employeeDelResults) => {
                                if (err) {
                                    console.error('❌ Error deleting employee:', err);
                                    return db.rollback(() => {
                                        res.status(500).send('Error deleting employee: ' + err.message);
                                    });
                                }

                                // Commit the transaction
                                db.commit(err => {
                                    if (err) {
                                        console.error('❌ Error committing transaction:', err);
                                        return db.rollback(() => {
                                            res.status(500).send('Error committing transaction: ' + err.message);
                                        });
                                    }

                                    console.log(`✅ Successfully removed employee ${employeeName} (ID: ${id})`);
                                    res.send(`Employee ${employeeName} removed successfully`);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/view-departments', (req, res) => {
    const query = `
        SELECT d.id AS Department_ID, d.name AS Department_Name, 
               e.id AS Employee_ID, e.name AS Employee_Name, e.position 
        FROM departments d 
        LEFT JOIN employees e ON d.id = e.department_id 
        ORDER BY d.id, e.id;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error fetching departments and employees:', err);
            return res.status(500).send('Error fetching departments and employees');
        }

        // Group results by department
        const departments = {};
        results.forEach(row => {
            const { Department_ID, Department_Name, Employee_ID, Employee_Name, position } = row;
            if (!departments[Department_ID]) {
                departments[Department_ID] = {
                    name: Department_Name,
                    employees: []
                };
            }
            if (Employee_ID) {
                departments[Department_ID].employees.push({
                    id: Employee_ID,
                    name: Employee_Name,
                    position: position
                });
            }
        });

        res.json(departments);
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

    console.log('📊 Fetching attendance records for employee ID:', employeeId);

    if (!employeeId) {
        console.log('⚠️ No employee ID provided');
        return res.status(400).send('Employee ID is required');
    }

    // First check if the employee exists
    db.query('SELECT id, name FROM employees WHERE id = ?', [employeeId], (err, employeeResults) => {
        if (err) {
            console.error('❌ Error checking employee:', err);
            return res.status(500).send('Server error');
        }

        if (employeeResults.length === 0) {
            console.log('⚠️ Employee not found with ID:', employeeId);
            return res.status(404).send('Employee not found');
        }

        const employeeName = employeeResults[0].name;
        console.log('✅ Found employee:', employeeName);

        // Now fetch attendance records
        db.query(
            `SELECT a.date, a.status 
             FROM attendance a 
             WHERE a.employee_id = ?
             ORDER BY a.date DESC`,
            [employeeId],
            (err, results) => {
                if (err) {
                    console.error('❌ Error fetching attendance records:', err);
                    return res.status(500).send('Server error');
                }

                console.log(`✅ Found ${results.length} attendance records for ${employeeName}`);

                // Add employee name to each record
                const recordsWithName = results.map(record => ({
                    ...record,
                    employeeName: employeeName
                }));

                res.json(recordsWithName);
            }
        );
    });
});

app.get('/get-department/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    console.log('Received request for department info, employee ID:', employeeId);

    if (!employeeId) {
        console.error('No employee ID provided');
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT e.name, e.position, d.name 
             FROM employees e 
             JOIN departments d ON e.department_id = d.id 
             WHERE e.id = ?`,
            [employeeId]
        );
        console.log('Query results:', rows);

        if (rows.length === 0) {
            console.log('No department found for employee ID:', employeeId);
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Database error fetching department information:', err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
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

    console.log(`📊 Inserting salary data: Employee ID=${employeeId}, Base Salary=${baseSalary}, Month=${payrollMonth}, Year=${payrollYear}`);

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

app.get('/get-salary-history', (req, res) => {
    const { employeeId } = req.query;
    console.log('📊 Fetching salary history for employee:', employeeId);
    if (!employeeId) {
        return res.status(400).send('Employee ID is required');
    }
    const query = 'SELECT * FROM payroll WHERE id = ? ORDER BY payroll_year, payroll_month';
    db.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error('❌ Error fetching salary history:', err);
            return res.status(500).send('Error fetching salary history');
        }
        console.log(`✅ Found ${results.length} salary records`);
        res.json(results);
    });
});

// Example using Express and a SQL database
app.get('/get-name/:employeeId', (req, res) => {
    const { employeeId } = req.params;
    console.log('Received request for employee name, ID:', employeeId);
    if (!employeeId) {
        console.error('No employee ID provided');
        return res.status(400).json({ error: 'Employee ID is required' });
    }
    const sql = "SELECT name FROM employees WHERE id = ?";
    db.query(sql, [employeeId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.json({ name: result[0].name });
        } else {
            res.status(404).json({ message: "Employee not found" });
        }
    });
});

app.post('/get-attendance-by-month-admin', (req, res) => {
    const { id, month, year } = req.body;
    console.log('📊 Fetching attendance records:', { id, month, year });

    if (!id || !month || !year) {
        console.log('⚠️ Missing required parameters');
        return res.status(400).json({
            success: false,
            message: 'Employee ID, month, and year are required'
        });
    }

    const query = `
        SELECT * 
        FROM attendance 
        WHERE employee_id = ? 
        AND MONTH(date) = ? 
        AND YEAR(date) = ?
        ORDER BY date DESC
    `;

    db.query(query, [id, month, year], (err, results) => {
        if (err) {
            console.error('❌ Error fetching attendance records:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching attendance records'
            });
        }

        console.log(`✅ Found ${results.length} attendance records`);
        res.json(results); // Return the results directly
    });
});
// Endpoint to get attendance records by month
app.post('/get-attendance-by-month-admin', (req, res) => {
    const { id, month, year } = req.body;
    console.log('📊 Fetching attendance records:', { id, month, year });

    if (!id || !month || !year) {
        console.log('⚠️ Missing required parameters');
        return res.status(400).json({
            success: false,
            message: 'Employee ID, month, and year are required'
        });
    }

    const query = `
        SELECT * 
        FROM attendance 
        WHERE employee_id = ? 
        AND MONTH(date) = ? 
        AND YEAR(date) = ?
        ORDER BY date DESC
    `;

    db.query(query, [id, month, year], (err, results) => {
        if (err) {
            console.error('❌ Error fetching attendance records:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching attendance records'
            });
        }

        console.log(`✅ Found ${results.length} attendance records`);
        res.json(results); // Return the results directly
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