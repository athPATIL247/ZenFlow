# Database Schema and Management

This document provides an overview of the database schema, including table structures, triggers, and instructions for managing and updating records.

## Table Structures

### Departments
- **id**: INT, Primary Key, Auto Increment
- **name**: VARCHAR(100), Not Null

### Employees
- **id**: INT, Primary Key, Auto Increment
- **name**: VARCHAR(100), Not Null
- **department_id**: INT, Foreign Key References `departments(id)`
- **position**: VARCHAR(100), Not Null
- **date_joined**: DATE, Not Null

### Users
- **employee_id**: INT, Primary Key, Foreign Key References `employees(id)`
- **password**: VARCHAR(255), Not Null
- **role**: ENUM('admin', 'employee'), Not Null

### Bank Details
- **employee_id**: INT, Primary Key, Foreign Key References `employees(id)`
- **bank_name**: VARCHAR(100), Not Null
- **account_number**: VARCHAR(20), Unique, Not Null
- **ifsc_code**: VARCHAR(20), Not Null

### Attendance
- **employee_id**: INT, Primary Key, Foreign Key References `employees(id)`
- **date**: DATE, Primary Key, Not Null
- **status**: ENUM('Present', 'Absent'), Not Null
- **leave_type**: VARCHAR(50)
- **work_hours**: INT, Default 8

### Payroll
- **id**: INT, Primary Key, Foreign Key References `employees(id)`
- **base_salary**: DECIMAL(10,2)
- **income_tax**: DECIMAL(10,2)
- **PF**: DECIMAL(10,2)
- **LWP**: DECIMAL(10,2)
- **totalDeduction**: DECIMAL(10,2)
- **payroll_month**: INT, Not Null
- **payroll_year**: INT, Not Null

## Triggers

### before_insert_update_payroll
This trigger calculates the `LWP`, `income_tax`, `PF`, and `totalDeduction` before inserting a new record into the `payroll` table.

#### Income Tax Calculation
- **0%** for `base_salary` <= 33,000
- **5%** for `base_salary` > 33,000 and <= 66,000
- **10%** for `base_salary` > 66,000 and <= 100,000
- **15%** for `base_salary` > 100,000 and <= 133,000
- **20%** for `base_salary` > 133,000 and <= 166,000
- **25%** for `base_salary` > 166,000 and <= 200,000
- **30%** for `base_salary` > 200,000

## Managing Triggers

### Deleting a Trigger
To delete an existing trigger, use the following SQL command:
```sql
DROP TRIGGER IF EXISTS before_insert_update_payroll;
```

### Creating or Updating a Trigger
To create or update a trigger, use the `CREATE TRIGGER` statement with the desired logic.

## Updating Payroll Records

To update existing records in the `payroll` table to reflect new calculations, use the following SQL command:
```sql
UPDATE payroll
SET 
    income_tax = CASE
        WHEN base_salary <= 33000 THEN 0
        WHEN base_salary > 33000 AND base_salary <= 66000 THEN base_salary * 0.05
        WHEN base_salary > 66000 AND base_salary <= 100000 THEN base_salary * 0.10
        WHEN base_salary > 100000 AND base_salary <= 133000 THEN base_salary * 0.15
        WHEN base_salary > 133000 AND base_salary <= 166000 THEN base_salary * 0.20
        WHEN base_salary > 166000 AND base_salary <= 200000 THEN base_salary * 0.25
        ELSE base_salary * 0.30
    END,
    PF = base_salary * 0.12,
    totalDeduction = LWP + CASE
        WHEN base_salary <= 33000 THEN 0
        WHEN base_salary > 33000 AND base_salary <= 66000 THEN base_salary * 0.05
        WHEN base_salary > 66000 AND base_salary <= 100000 THEN base_salary * 0.10
        WHEN base_salary > 100000 AND base_salary <= 133000 THEN base_salary * 0.15
        WHEN base_salary > 133000 AND base_salary <= 166000 THEN base_salary * 0.20
        WHEN base_salary > 166000 AND base_salary <= 200000 THEN base_salary * 0.25
        ELSE base_salary * 0.30
    END + (base_salary * 0.12);
```

## Running the Project

### Prerequisites
- **Node.js**: Ensure Node.js is installed on your system.
- **MySQL**: Ensure MySQL server is running and accessible.

### Steps
1. **Clone the Repository**: Clone the project repository to your local machine.
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**: Install the necessary Node.js dependencies.
   ```bash
   npm install
   ```

3. **Set Up the Database**:
   - Import the `schema.sql` file into your MySQL database to create the necessary tables and triggers.
   - Configure your database connection settings in the `server.js` or configuration file.

4. **Run the Server**: Start the Node.js server.
   ```bash
   node server.js
   ```

5. **Access the Application**: Open your web browser and navigate to `http://localhost:<port>` to access the application.

## Notes
- Ensure you have the necessary permissions to modify triggers and update records.
- Always back up your data before performing bulk updates or schema changes.
