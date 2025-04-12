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
    database: 'zenflow2'
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

// Monthly Statistics Endpoint
app.get('/monthly-stats', (req, res) => {
    const { employeeId, month, year } = req.query;
    console.log('📊 Fetching monthly stats:', { employeeId, month, year });

    if (!employeeId || !month || !year) {
        console.log('⚠️ Missing required parameters');
        return res.status(400).json({ 
            success: false, 
            message: 'Employee ID, month, and year are required' 
        });
    }

    // Calculate the total number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Calculate weekdays in the month (excluding weekends)
    let workingDaysInMonth = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDaysInMonth++;
        }
    }

    // Get attendance records for the employee in the specified month
    const query = `
        SELECT 
            COUNT(CASE WHEN status = 'Present' THEN 1 END) as presentDays,
            COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absentDays,
            SUM(work_hours) as totalWorkHours
        FROM attendance 
        WHERE employee_id = ? 
        AND MONTH(date) = ? 
        AND YEAR(date) = ?
    `;

    db.query(query, [employeeId, month, year], (err, results) => {
        if (err) {
            console.error('❌ Error fetching monthly stats:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching monthly statistics' 
            });
        }

        // Process the results
        const stats = results[0] || { presentDays: 0, absentDays: 0, totalWorkHours: 0 };
        
        // Calculate additional statistics
        const totalDaysRecorded = (stats.presentDays || 0) + (stats.absentDays || 0);
        const attendanceRate = totalDaysRecorded > 0 
            ? Math.round((stats.presentDays / totalDaysRecorded) * 100) 
            : 0;
        
        // Calculate percentage of working days covered
        const workingDaysCoverage = workingDaysInMonth > 0 
            ? Math.round((totalDaysRecorded / workingDaysInMonth) * 100) 
            : 0;
        
        // Prepare the response
        const enhancedStats = {
            ...stats,
            daysInMonth: daysInMonth,
            workingDaysInMonth: workingDaysInMonth,
            attendanceRate: attendanceRate,
            workingDaysCoverage: workingDaysCoverage,
            presentDays: stats.presentDays || 0,
            absentDays: stats.absentDays || 0,
            totalWorkHours: stats.totalWorkHours || 0,
            averageWorkHours: totalDaysRecorded > 0 
                ? Math.round((stats.totalWorkHours || 0) / totalDaysRecorded * 10) / 10
                : 0
        };
        
        console.log('✅ Monthly stats calculated:', enhancedStats);
        res.json({ success: true, stats: enhancedStats });
    });
});

// Attendance Overview Endpoint
app.get('/attendance-overview', (req, res) => {
    const { employeeId, month, year } = req.query;
    console.log('📊 Fetching attendance overview:', { employeeId, month, year });

    if (!employeeId || !month || !year) {
        console.log('⚠️ Missing required parameters');
        return res.status(400).json({ 
            success: false, 
            message: 'Employee ID, month, and year are required' 
        });
    }

    // Get the dates in the specified month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Query to get attendance records for the month
    const query = `
        SELECT 
            date,
            status,
            work_hours,
            leave_type
        FROM attendance 
        WHERE employee_id = ? 
        AND MONTH(date) = ? 
        AND YEAR(date) = ?
        ORDER BY date
    `;

    db.query(query, [employeeId, month, year], (err, results) => {
        if (err) {
            console.error('❌ Error fetching attendance overview:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching attendance overview' 
            });
        }

        // Create a map of attendance records by date
        const attendanceMap = {};
        results.forEach(record => {
            const dateObj = new Date(record.date);
            const day = dateObj.getDate();
            attendanceMap[day] = {
                status: record.status,
                work_hours: record.work_hours,
                leave_type: record.leave_type
            };
        });

        // Count present and absent days
        const presentDays = results.filter(r => r.status === 'Present').length;
        const absentDays = results.filter(r => r.status === 'Absent').length;
        const totalDaysRecorded = presentDays + absentDays;

        // Calculate attendance percentage
        const attendancePercentage = totalDaysRecorded > 0 
            ? (presentDays / totalDaysRecorded * 100).toFixed(1) 
            : '0.0';

        // Calculate total and average work hours
        const totalWorkHours = results.reduce((sum, r) => sum + (r.work_hours || 0), 0);
        const avgWorkHours = totalDaysRecorded > 0 
            ? (totalWorkHours / totalDaysRecorded).toFixed(1) 
            : '0.0';

        // Create the overview object
        const overview = {
            attendance: results,
            daysInMonth: daysInMonth,
            totalWorkingDays: totalDaysRecorded,
            presentDays: presentDays,
            absentDays: absentDays,
            attendancePercentage: attendancePercentage,
            totalWorkHours: totalWorkHours,
            avgWorkHours: avgWorkHours
        };

        console.log('✅ Attendance overview calculated');
        res.json({ success: true, overview });
    });
});

// Recent Activity Endpoint
app.get('/recent-activity', (req, res) => {
    const { employeeId } = req.query;
    console.log('📊 Fetching recent activity for employee:', employeeId);

    const query = `
        (SELECT 
            'attendance' as type,
            date as timestamp,
            CONCAT('Marked ', status, ' for ', DATE_FORMAT(date, '%M %d, %Y')) as description
         FROM attendance 
         WHERE employee_id = ?
         ORDER BY date DESC
         LIMIT 5)
        UNION
        (SELECT 
            'salary' as type,
            CONCAT(payroll_year, '-', payroll_month, '-01') as timestamp,
            CONCAT('Salary processed for ', MONTHNAME(CONCAT(payroll_year, '-', payroll_month, '-01')), ' ', payroll_year) as description
         FROM payroll 
         WHERE id = ?
         ORDER BY payroll_year DESC, payroll_month DESC
         LIMIT 5)
        ORDER BY timestamp DESC
        LIMIT 10
    `;

    db.query(query, [employeeId, employeeId], (err, results) => {
        if (err) {
            console.error('❌ Error fetching recent activity:', err);
            return res.status(500).json({ success: false, message: 'Error fetching recent activity' });
        }
        console.log(`✅ Found ${results.length} recent activities`);
        res.json({ success: true, activities: results });
    });
});

// Get employee profile details
app.get('/get-employee', (req, res) => {
    const { employeeId } = req.query;
    console.log('👤 Fetching employee profile:', employeeId);

    if (!employeeId) {
        console.log('⚠️ No employee ID provided');
        return res.status(400).json({ 
            success: false, 
            message: 'Employee ID is required' 
        });
    }

    const query = `
        SELECT e.*, d.name as department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.id = ?
    `;

    db.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error('❌ Error fetching employee profile:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching employee profile: ' + err.message 
            });
        }
        
        if (results.length === 0) {
            console.log('⚠️ Employee not found with ID:', employeeId);
            return res.status(404).json({ 
                success: false, 
                message: 'Employee not found' 
            });
        }
        
        console.log('✅ Employee profile retrieved:', results[0]);
        res.json({ 
            success: true, 
            employee: results[0] 
        });
    });
});

// Debug endpoint for monthly stats
app.get('/debug-monthly-stats', (req, res) => {
    const { employeeId, month, year } = req.query;
    console.log('🔍 DEBUG: Fetching monthly stats:', { employeeId, month, year });

    // Step 1: Check attendance table structure
    db.query('DESCRIBE attendance', (err, tableInfo) => {
        if (err) {
            console.error('❌ Error describing attendance table:', err);
            return res.status(500).json({ 
                success: false, 
                step: 'describe_table',
                error: err.message 
            });
        }

        // Step 2: Check if employee exists
        db.query('SELECT * FROM employees WHERE id = ?', [employeeId], (err, employeeResults) => {
            if (err) {
                console.error('❌ Error checking employee existence:', err);
                return res.status(500).json({ 
                    success: false, 
                    step: 'check_employee',
                    error: err.message 
                });
            }

            if (employeeResults.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Employee not found' 
                });
            }

            // Step 3: Check raw attendance records
            const attendanceQuery = `
                SELECT * FROM attendance 
                WHERE employee_id = ? 
                AND MONTH(date) = ? 
                AND YEAR(date) = ?
            `;

            db.query(attendanceQuery, [employeeId, month, year], (err, attendanceRecords) => {
                if (err) {
                    console.error('❌ Error fetching raw attendance records:', err);
                    return res.status(500).json({ 
                        success: false, 
                        step: 'fetch_attendance',
                        error: err.message 
                    });
                }

                // Step 4: Calculate stats
                const query = `
                    SELECT 
                        COUNT(CASE WHEN status = 'Present' THEN 1 END) as presentDays,
                        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absentDays,
                        SUM(work_hours) as totalWorkHours
                    FROM attendance 
                    WHERE employee_id = ? 
                    AND MONTH(date) = ? 
                    AND YEAR(date) = ?
                `;

                db.query(query, [employeeId, month, year], (err, statResults) => {
                    if (err) {
                        console.error('❌ Error calculating stats:', err);
                        return res.status(500).json({ 
                            success: false, 
                            step: 'calculate_stats',
                            error: err.message 
                        });
                    }

                    // Return all debug info
                    res.json({
                        success: true,
                        debug: {
                            params: { employeeId, month, year },
                            tableStructure: tableInfo,
                            employee: employeeResults[0],
                            rawAttendanceRecords: attendanceRecords,
                            calculatedStats: statResults[0]
                        }
                    });
                });
            });
        });
    });
});

// Simple test endpoint
app.get('/test', (req, res) => {
    console.log('🔍 Test endpoint called');
    res.json({ 
        success: true, 
        message: 'Server is running properly',
        time: new Date().toISOString()
    });
});

// Test monthly stats calculation directly
app.get('/test-monthly-stats', (req, res) => {
    const employeeId = req.query.employeeId || 3;
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();
    
    console.log('🔍 Test monthly stats with:', { employeeId, month, year });
    
    try {
        // Simple SQL to count attendance
        const query = `
            SELECT 
                COUNT(*) as totalRecords,
                COUNT(CASE WHEN status = 'Present' THEN 1 END) as presentDays,
                COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absentDays
            FROM attendance 
            WHERE employee_id = ? 
            AND MONTH(date) = ? 
            AND YEAR(date) = ?
        `;
        
        db.query(query, [employeeId, month, year], (err, results) => {
            if (err) {
                console.error('❌ SQL Error:', err);
                return res.status(500).json({
                    success: false,
                    error: err.message,
                    query: query,
                    params: [employeeId, month, year]
                });
            }
            
            const stats = results[0] || { totalRecords: 0, presentDays: 0, absentDays: 0 };
            
            // Return basic stats
            res.json({
                success: true,
                stats: stats,
                params: { employeeId, month, year }
            });
        });
    } catch (error) {
        console.error('❌ Runtime error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/get-today-attendance-count', (req, res) => {
    const { date } = req.query;
    console.log('📊 Fetching today\'s attendance count for date:', date);

    if (!date) {
        return res.status(400).json({ 
            success: false, 
            message: 'Date parameter is required' 
        });
    }

    const query = `
        SELECT COUNT(*) as count
        FROM attendance
        WHERE date = ? AND status = 'Present'
    `;

    db.query(query, [date], (err, results) => {
        if (err) {
            console.error('❌ Error fetching today\'s attendance count:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching attendance count' 
            });
        }

        console.log('✅ Today\'s attendance count:', results[0].count);
        res.json({ 
            success: true, 
            count: results[0].count 
        });
    });
});

app.get('/get-attendance-trends', (req, res) => {
    console.log('📊 Fetching attendance trends');

    const query = `
        SELECT 
            MONTH(date) as month,
            YEAR(date) as year,
            COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
            COUNT(*) as total_count
        FROM attendance
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY year ASC, month ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error fetching attendance trends:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching attendance trends' 
            });
        }

        // Calculate attendance rate for each month
        const trends = results.map(row => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const attendanceRate = (row.present_count / row.total_count) * 100;
            
            return {
                month: monthNames[row.month - 1],
                year: row.year,
                label: `${monthNames[row.month - 1]} ${row.year}`,
                attendanceRate: Math.round(attendanceRate * 10) / 10
            };
        });

        console.log('✅ Attendance trends fetched');
        res.json({ 
            success: true, 
            trends: trends
        });
    });
});

app.get('/get-payroll-summary', (req, res) => {
    const { period } = req.query;
    console.log('📊 Fetching payroll summary for period:', period);

    if (!period) {
        return res.status(400).json({ 
            success: false, 
            message: 'Period parameter is required' 
        });
    }

    let dateFilter;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    switch (period) {
        case 'current_month':
            dateFilter = `payroll_year = ${currentYear} AND payroll_month = ${currentMonth}`;
            break;
        case 'last_month':
            // Calculate last month and year (handling December to January transition)
            let lastMonth = currentMonth - 1;
            let lastMonthYear = currentYear;
            if (lastMonth === 0) {
                lastMonth = 12;
                lastMonthYear--;
            }
            dateFilter = `payroll_year = ${lastMonthYear} AND payroll_month = ${lastMonth}`;
            break;
        case 'last_3_months':
            // Calculate 3 months ago (handling year transitions)
            let threeMonthsAgo = currentMonth - 3;
            let threeMonthsAgoYear = currentYear;
            if (threeMonthsAgo <= 0) {
                threeMonthsAgo += 12;
                threeMonthsAgoYear--;
            }
            dateFilter = `(payroll_year > ${threeMonthsAgoYear} OR (payroll_year = ${threeMonthsAgoYear} AND payroll_month >= ${threeMonthsAgo}))`;
            break;
        case 'year_to_date':
            dateFilter = `payroll_year = ${currentYear}`;
            break;
        default:
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid period parameter' 
            });
    }

    const query = `
        SELECT 
            SUM(base_salary) as total_salary,
            SUM(income_tax) as total_tax,
            SUM(PF) as total_pf,
            SUM(LWP) as total_lwp,
            SUM(totalDeduction) as total_deduction
        FROM payroll
        WHERE ${dateFilter}
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error fetching payroll summary:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching payroll summary' 
            });
        }

        // Get the summary data from results
        const summary = results[0] || {
            total_salary: 0,
            total_tax: 0,
            total_pf: 0,
            total_lwp: 0,
            total_deduction: 0
        };

        console.log('✅ Payroll summary fetched:', summary);
        res.json({ 
            success: true, 
            summary: summary
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});