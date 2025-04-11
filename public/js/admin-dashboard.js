document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 DOM Content Loaded');

    const salaryPaymentForm = document.getElementById('salaryPaymentForm');
    const submitBtnSalary = document.getElementById('submitBtnSalary');

    console.log('📝 Salary Payment Form:', salaryPaymentForm);
    console.log('🔘 Submit Button:', submitBtnSalary);

    if (salaryPaymentForm) {
        salaryPaymentForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('📤 Form submission started');

            const employeeId = document.getElementById('employeeId').value;
            const baseSalary = document.getElementById('baseSalary').value;
            const payrollMonth = document.getElementById('payrollMonth').value;
            const payrollYear = document.getElementById('payrollYear').value;

            console.log('📊 Form Data:', { employeeId, baseSalary, payrollMonth, payrollYear });

            if (!employeeId || !baseSalary || !payrollMonth || !payrollYear) {
                console.log('⚠️ Missing required fields');
                alert('All fields are required');
                return;
            }

            try {
                console.log('🌐 Sending request to server');
                const response = await fetch('http://localhost:3001/add-salary-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        employeeId,
                        baseSalary,
                        payrollMonth,
                        payrollYear
                    })
                });

                console.log('📥 Server response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Server error:', errorText);
                    throw new Error(errorText);
                }

                const result = await response.text();
                console.log('✅ Success:', result);

                alert('Salary payment recorded successfully');
                salaryPaymentForm.reset();

                // Optionally hide the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('salaryPaymentModal'));
                if (modal) {
                    modal.hide();
                }

            } catch (error) {
                console.error('❌ Error:', error);
                alert('Error recording salary payment: ' + error.message);
            }
        });
    } else {
        console.error('❌ Salary payment form not found');
    }

    // Add click handler for submit button as backup
    if (submitBtnSalary) {
        submitBtnSalary.addEventListener('click', function (e) {
            console.log('🔘 Submit button clicked');
            if (salaryPaymentForm) {
                salaryPaymentForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    document.getElementById('addEmployeeForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        console.log('📝 Add employee form submitted');

        const name = document.getElementById('employeeName').value;
        const departmentId = document.getElementById('departmentId').value;
        const position = document.getElementById('position').value;
        const dateJoined = document.getElementById('dateJoined').value;

        console.log('📊 Form Data:', { name, departmentId, position, dateJoined });

        if (!name || !departmentId || !position || !dateJoined) {
            console.log('⚠️ Missing required fields');
            alert('Please fill in all required fields');
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Adding...';

        try {
            console.log('🌐 Sending request to add employee');
            const response = await fetch('http://localhost:3001/add-employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    departmentId,
                    position,
                    dateJoined
                })
            });

            console.log('📥 Server response status:', response.status);

            if (response.ok) {
                const result = await response.text();
                console.log('✅ Success:', result);
                alert(result);

                // Reset the form and close the modal
                document.getElementById('addEmployeeForm').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
                if (modal) {
                    modal.hide();
                }

                // Optionally refresh the employee list if it's visible
                if (document.getElementById('employeeTableSection').style.display === 'block') {
                    document.getElementById('viewEmployeesButton').click();
                }
            } else {
                const errorMessage = await response.text();
                console.error('❌ Server error:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('Error adding employee: ' + error.message);
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // Handle removing an employee
    document.getElementById('removeEmployeeForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        console.log('🗑️ Remove employee form submitted');

        const employeeId = document.getElementById('removeEmployeeId').value;
        console.log('📝 Employee ID to remove:', employeeId);

        if (!employeeId) {
            console.log('⚠️ No employee ID provided');
            alert('Please enter an Employee ID');
            return;
        }

        // Confirm before removing
        if (!confirm(`Are you sure you want to remove employee with ID ${employeeId}? This will also delete all related records including user accounts, payroll records, and attendance records.`)) {
            console.log('❌ Removal cancelled by user');
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Removing...';

        try {
            console.log('🌐 Sending request to remove employee');
            const response = await fetch('http://localhost:3001/remove-employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: employeeId })
            });

            console.log('📥 Server response status:', response.status);

            if (response.ok) {
                const result = await response.text();
                console.log('✅ Success:', result);
                alert(result);

                // Reset the form and close the modal
                document.getElementById('removeEmployeeForm').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('removeEmployeeModal'));
                if (modal) {
                    modal.hide();
                }

                // Optionally refresh the employee list if it's visible
                if (document.getElementById('employeeTableSection').style.display === 'block') {
                    document.getElementById('viewEmployeesButton').click();
                }
            } else {
                const errorMessage = await response.text();
                console.error('❌ Server error:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('Error removing employee: ' + error.message);
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });


    document.getElementById('ViewAttendanceEmployeeForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        console.log('🗑️ Fetch attendance form submitted');

        const id = document.getElementById('ViewAttendanceEmployeeId').value;
        const month = document.getElementById('ViewAttendanceEmployeeMonth').value;
        const year = document.getElementById('ViewAttendanceEmployeeYear').value;
        console.log('📝 Employee ID to fetch:', id);

        if (!id || !month || !year) {
            console.log('⚠️ Missing required fields');
            alert('Please enter Employee ID, Month, and Year');
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Fetching...';

        try {
            console.log('🌐 Sending request to fetch attendance records of employee');
            const response = await fetch('http://localhost:3001/get-attendance-by-month-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, month, year })
            });

            console.log('📥 Server response status:', response.status);

            if (response.ok) {
                const records = await response.json();
                console.log('✅ Attendance records fetched:', records);
                displayAttendanceRecords(records); // Call the function to display records

                // Reset the form and close the modal
                document.getElementById('ViewAttendanceEmployeeForm').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('ViewAttendanceEmployee'));
                if (modal) {
                    modal.hide(); // Close the modal
                }

                // Hide the employee table section
                document.getElementById('employeeTableSection').style.display = 'none';
                // Show the attendance records section
                document.getElementById('attendanceRecordsSection').style.display = 'block';
            } else {
                const errorMessage = await response.text();
                console.error('❌ Server error:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('Error fetching attendance records: ' + error.message);
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });



    // Handle viewing employees
    document.getElementById('viewEmployeesButton').addEventListener('click', async function () {
        const response = await fetch('/view-employees');
        const employees = await response.json();
        const tableBody = document.getElementById('employeeTableBody');

        tableBody.innerHTML = ''; // Clear existing rows
        document.getElementById('employeeTableSection').style.display = 'block'; // Show the table section

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.department_id}</td>
                <td>${employee.position}</td>
                <td>${employee.date_joined}</td>
            `;
            tableBody.appendChild(row);
        });
    });

    // Call viewEmployees when the modal is opened
    document.getElementById('viewEmployeeModal').addEventListener('show.bs.modal', viewEmployees);

    // Add event listener for "View Attendance History"
    document.getElementById('viewAttendanceHistory').addEventListener('click', function () {
        // Show the attendance records section
        document.getElementById('attendanceRecordsSection').style.display = 'block';

        // Focus on the employee ID input field
        document.getElementById('attendanceEmployeeId').focus();

        // Set current month and year as default values
        const currentDate = new Date();
        document.getElementById('attendanceMonth').value = currentDate.getMonth() + 1; // getMonth() returns 0-11
        document.getElementById('attendanceYear').value = currentDate.getFullYear();
    });

    // Function to display attendance records in a table
    function displayAttendanceRecords(records) {
        const tableBody = document.getElementById('attendanceTableBody');
        tableBody.innerHTML = ''; // Clear existing rows

        if (records.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="2" class="text-center">No attendance records found</td>';
            tableBody.appendChild(row);
            return;
        }

        records.forEach(record => {
            const row = document.createElement('tr');

            // Format the date to be more readable
            const dateObj = new Date(record.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            // Add status class for styling
            const statusClass = record.status === 'Present' ? 'text-success' : 'text-danger';

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td class="${statusClass}">${record.status}</td>
            `;
            tableBody.appendChild(row);
        });

        // Show the attendance records section
        document.getElementById('attendanceRecordsSection').style.display = 'block';
    }

    // Add event listener for "View Department"
    document.getElementById('viewDepartment').addEventListener('click', async function () {
        const employeeId = localStorage.getItem('employeeId'); // Fetch employeeId from local storage

        if (employeeId) {
            const response = await fetch(`/get-department?employeeId=${employeeId}`);

            if (response.ok) {
                const departmentInfo = await response.json();
                displayDepartmentInfo(departmentInfo);
            } else {
                const errorMessage = await response.text();
                alert('Error: ' + errorMessage);
            }
        } else {
            alert("Employee ID is required.");
        }
    });

    // Function to display department information in a modal
    function displayDepartmentInfo(info) {
        const modalBody = document.getElementById('departmentTableBody');
        modalBody.innerHTML = ''; // Clear existing rows

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${info.name}</td>
            <td>${info.department_name}</td>
        `;
        modalBody.appendChild(row);

        // Show the department information modal
        const departmentModal = new bootstrap.Modal(document.getElementById('departmentModal'));
        departmentModal.show();
    }

    // Show the salary payment modal when the button is clicked
    document.getElementById("salaryPaymentButton").addEventListener("click", function () {
        var salaryModal = new bootstrap.Modal(document.getElementById("salaryPaymentModal"));
        salaryModal.show();
    });

    // Handle attendance filter form submission
    console.log('Admin dashboard script loaded');

});



document.addEventListener("DOMContentLoaded", function () {
    const viewBtn = document.getElementById('viewDepartmentsButton');
    console.log('🔍 View Departments Button:', viewBtn);

    if (viewBtn) {
        viewBtn.addEventListener('click', async function () {
            console.log('🔄 Fetching departments');
            try {
                const response = await fetch('/view-departments');
                if (!response.ok) {
                    throw new Error('Failed to fetch departments');
                }

                const departments = await response.json();
                displayDepartments(departments);
            } catch (error) {
                console.error('❌ Error fetching departments:', error);
                alert('Error fetching departments: ' + error.message);
            }
        });
    } else {
        console.warn('⚠️ viewDepartmentsButton NOT found in DOM!');
    }

    function displayDepartments(departments) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = ''; // Clear existing content
    
        const table = document.createElement('table');
        table.className = 'table table-bordered table-hover';
        table.style.width = '80%';
        table.style.margin = '20px auto';
        
        // Create table header with department info and employee columns
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Department ID</th>
                    <th>Department Name</th>
                    <th colspan="3">Employees</th>
                </tr>
                <tr>
                    <th></th>
                    <th></th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Position</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
    
        const tbody = table.querySelector('tbody');
    
        for (const [id, department] of Object.entries(departments)) {
            if (department.employees.length === 0) {
                // If no employees, create a single row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${id}</td>
                    <td>${department.name}</td>
                    <td colspan="3">No employees in this department.</td>
                `;
                tbody.appendChild(row);
            } else {
                // If there are employees, create a row for each employee
                department.employees.forEach((emp, index) => {
                    const row = document.createElement('tr');
                    if (index === 0) {
                        // First employee row includes department info
                        row.innerHTML = `
                            <td rowspan="${department.employees.length}">${id}</td>
                            <td rowspan="${department.employees.length}">${department.name}</td>
                            <td>${emp.id}</td>
                            <td>${emp.name}</td>
                            <td>${emp.position}</td>
                        `;
                    } else {
                        // Subsequent employee rows only include employee info
                        row.innerHTML = `
                            <td>${emp.id}</td>
                            <td>${emp.name}</td>
                            <td>${emp.position}</td>
                        `;
                    }
                    tbody.appendChild(row);
                });
            }
        }
    
        mainContent.appendChild(table);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Add event listener for View Salary History button
    document.getElementById('viewSalaryHistory').addEventListener('click', function () {
        // Show the modal for entering employee ID
        const modal = new bootstrap.Modal(document.getElementById('ViewSalaryHistoryEmployee'));
        modal.show();
    });

    // Handle the salary history form submission
    document.getElementById('ViewSalaryHistoryForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const employeeId = document.getElementById('ViewSalaryHistoryEmployeeId').value;

        if (!employeeId) {
            alert('Please enter an Employee ID');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/get-salary-history?employeeId=${employeeId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch salary history');
            }

            const salaryHistory = await response.json();

            // Close the employee ID input modal
            const inputModal = bootstrap.Modal.getInstance(document.getElementById('ViewSalaryHistoryEmployee'));
            inputModal.hide();

            // Display the salary history
            displaySalaryHistory(salaryHistory);

        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching salary history: ' + error.message);
        }
    });

    // Function to display salary history
    function displaySalaryHistory(salaryHistory) {
        const tableBody = document.getElementById('salaryHistoryTableBody');
        tableBody.innerHTML = ''; // Clear existing rows

        if (salaryHistory.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No salary records found</td></tr>';
        } else {
            salaryHistory.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${record.payroll_month}</td>
                <td>${record.payroll_year}</td>
                <td>₹${record.base_salary}</td>
                <td>₹${record.income_tax}</td>
                <td>₹${record.PF}</td>
                <td>₹${record.LWP}</td>
                <td>₹${record.totalDeduction}</td>
            `;
                tableBody.appendChild(row);
            });
        }

        // Show the salary history display modal
        const displayModal = new bootstrap.Modal(document.getElementById('salaryHistoryDisplayModal'));
        displayModal.show();
    }
})