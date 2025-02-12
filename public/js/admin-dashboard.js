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
            <td>${employee.salary}</td>
            <td>${employee.bank_details}</td>
            <td>${employee.date_joined}</td>
        `;
        tableBody.appendChild(row);
    });
});

// Call viewEmployees when the modal is opened
document.getElementById('viewEmployeeModal').addEventListener('show.bs.modal', viewEmployees); 