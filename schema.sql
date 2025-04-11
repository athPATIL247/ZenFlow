CREATE TABLE `departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department_id INT NOT NULL,
  position VARCHAR(100) NOT NULL,
  date_joined DATE NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE users (
  employee_id INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL,
  PRIMARY KEY (employee_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE bankdetails (
  employee_id INT NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(20) NOT NULL UNIQUE,
  ifsc_code VARCHAR(20) NOT NULL,
  PRIMARY KEY (employee_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent') NOT NULL,
  leave_type VARCHAR(50),
  work_hours INT DEFAULT 8,
  PRIMARY KEY (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE payroll (
  id INT NOT NULL,
  base_salary DECIMAL(10,2),
  income_tax DECIMAL(10,2),
  PF DECIMAL(10,2),
  LWP DECIMAL(10,2),
  totalDeduction DECIMAL(10,2),
  payroll_month INT NOT NULL,
  payroll_year INT NOT NULL,
  PRIMARY KEY (id, payroll_month, payroll_year)
);

-- Triggers: 

DELIMITER //

CREATE TRIGGER after_update_attendance
AFTER UPDATE ON attendance
FOR EACH ROW
BEGIN
    UPDATE payroll
    SET totalDeduction = LWP + income_tax + PF
    WHERE id = NEW.employee_id
      AND payroll_month = MONTH(NEW.date)
      AND payroll_year = YEAR(NEW.date);
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER before_insert_update_payroll
BEFORE INSERT ON payroll
FOR EACH ROW
BEGIN
    DECLARE total_days INT;
    DECLARE working_days INT;
    DECLARE absent_days INT;
    DECLARE is_leap_year BOOLEAN;
    DECLARE base_salary DECIMAL(10,2);

    SELECT base_salary INTO base_salary
    FROM payroll WHERE id = NEW.id LIMIT 1;

    SET is_leap_year = (NEW.payroll_year % 4 = 0 AND NEW.payroll_year % 100 <> 0) OR (NEW.payroll_year % 400 = 0);

    SET total_days = CASE
        WHEN NEW.payroll_month IN (1, 3, 5, 7, 8, 10, 12) THEN 31
        WHEN NEW.payroll_month IN (4, 6, 9, 11) THEN 30
        WHEN NEW.payroll_month = 2 AND is_leap_year THEN 29
        ELSE 28
    END;

    SELECT COUNT(*) INTO working_days
    FROM attendance
    WHERE employee_id = NEW.id
      AND MONTH(date) = NEW.payroll_month
      AND YEAR(date) = NEW.payroll_year
      AND status = 'Present';

    SET absent_days = total_days - working_days;

    IF base_salary IS NULL THEN
        SET base_salary = NEW.base_salary;
    END IF;

    SET NEW.LWP = absent_days * (base_salary / total_days);
    SET NEW.income_tax = base_salary * 0.10;
    SET NEW.PF = base_salary * 0.12;
    SET NEW.totalDeduction = NEW.LWP + NEW.income_tax + NEW.PF;
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER calculate_LWP
BEFORE INSERT ON payroll
FOR EACH ROW
BEGIN
    DECLARE absent_days INT;
    DECLARE total_days INT;

    SELECT COUNT(*) INTO absent_days
    FROM attendance
    WHERE employee_id = NEW.id
      AND status = 'Absent'
      AND MONTH(date) = NEW.payroll_month
      AND YEAR(date) = NEW.payroll_year;

    SELECT DAY(LAST_DAY(CONCAT(NEW.payroll_year, '-', NEW.payroll_month, '-01')))
    INTO total_days;

    SET NEW.LWP = absent_days * (NEW.base_salary / total_days);
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER calculate_totalDeductions
BEFORE INSERT ON payroll
FOR EACH ROW
BEGIN
    SET NEW.totalDeduction = NEW.income_tax + NEW.PF + NEW.LWP;
END;
//

DELIMITER ;