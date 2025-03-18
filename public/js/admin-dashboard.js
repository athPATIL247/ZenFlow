document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addEmployeeForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('employeeName').value;
        const departmentId = document.getElementById('departmentId').value;
        const position = document.getElementById('position').value;
        const salary = document.getElementById('salary').value;
        const bankDetails = document.getElementById('bankDetails').value;
        const dateJoined = document.getElementById('dateJoined').value;

        const response = await fetch('/add-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, departmentId, position, salary, bankDetails, dateJoined })
        });

        if (response.ok) {
            alert('Employee added successfully!');
            document.getElementById('addEmployeeModal').modal('hide');
            document.getElementById('addEmployeeForm').reset();
        } else {
            const errorMessage = await response.text();
            alert('Error: ' + errorMessage);
        }
    });

    // Handle removing an employee
    document.getElementById('removeEmployeeForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const employeeId = document.getElementById('removeEmployeeId').value;

        const response = await fetch('/remove-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: employeeId })
        });

        if (response.ok) {
            alert('Employee removed successfully!');
            document.getElementById('removeEmployeeModal').modal('hide');
            document.getElementById('removeEmployeeForm').reset();
        } else {
            const errorMessage = await response.text();
            alert('Error: ' + errorMessage);
        }
    });

    // Handle viewing employees
    document.getElementById('viewEmployeesButton').addEventListener('click', async function() {
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
    document.getElementById('viewAttendanceHistory').addEventListener('click', async function() {
        const employeeId = prompt("Please enter the Employee ID to view attendance history:");
        
        if (employeeId) {
            const response = await fetch(`/get-attendance?employeeId=${employeeId}`);
            
            if (response.ok) {
                const attendanceRecords = await response.json();
                displayAttendanceRecords(attendanceRecords);
                document.getElementById('attendanceRecordsSection').style.display = 'block'; // Show the section
            } else {
                const errorMessage = await response.text();
                alert('Error: ' + errorMessage);
            }
        } else {
            alert("Employee ID is required.");
        }
    });

    // Function to display attendance records in a table
    function displayAttendanceRecords(records) {
        const tableBody = document.getElementById('attendanceTableBody');
        tableBody.innerHTML = ''; // Clear existing rows

        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.status}</td>   
            `;
            tableBody.appendChild(row);
        });
    }

    // Add event listener for "View Department"
    document.getElementById('viewDepartment').addEventListener('click', async function() {
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

    // Handle salary payment form submission
    document.getElementById('salaryPaymentForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get values from the form inputs
        const employeeId = document.getElementById('employeeId').value.trim();
        const baseSalary = document.getElementById('baseSalary').value.trim();
        const payrollMonth = document.getElementById('payrollMonth').value.trim();
        const payrollYear = document.getElementById('payrollYear').value.trim();

        console.log('📝 Sending Data:', { employeeId, baseSalary, payrollMonth, payrollYear });

        // Check if all fields are filled
        if (!employeeId || !baseSalary || !payrollMonth || !payrollYear) {
            alert('Please fill in all fields.');
            return;
        }

        const response = await fetch('/add-salary-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ employeeId, baseSalary, payrollMonth, payrollYear })
        });

        if (response.ok) {
            alert('✅ Salary payment recorded successfully!');
            document.getElementById('salaryPaymentForm').reset();
            // Optionally hide the modal after successful submission
            const salaryModal = bootstrap.Modal.getInstance(document.getElementById("salaryPaymentModal"));
            salaryModal.hide();
        } else {
            const errorMessage = await response.text();
            console.error('❌ Error:', errorMessage);
            alert('Error: ' + errorMessage);
        }
    });

    console.log('Admin dashboard script loaded');
});
