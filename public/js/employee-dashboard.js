// Assuming you have a way to get the employee ID, e.g., from local storage or a hidden input
const employeeId = parseInt(localStorage.getItem('employeeId'),10); // or however you store it
console.log('Employee ID:', employeeId); // Debug log
const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format// Function to update attendance table

async function updateAttendanceTable() {
    const response = await fetch(`http://localhost:3001/get-attendance?employeeId=${employeeId}`);
    const attendanceRecords = await response.json();
    const tableBody = document.getElementById('attendanceTableBody');

    tableBody.innerHTML = ''; // Clear existing rows

    attendanceRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle marking attendance
document.getElementById('markAttendanceButton').addEventListener('click', async function() {
    const response = await fetch('http://localhost:3001/mark-attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeId, date: today }) // Ensure today is defined
    });

    if (response.ok) {
        alert('Attendance marked successfully!');
        document.getElementById('markAttendanceButton').disabled = true; // Disable button after marking
        await updateAttendanceTable(); // Update the attendance table
    } else {
        const errorMessage = await response.text();
        alert('Error: ' + errorMessage);
    }
});

// Function to fetch and display attendance records
async function fetchAttendanceHistory() {
    const response = await fetch(`http://localhost:3001/get-attendance?employeeId=${employeeId}`);
    const attendanceRecords = await response.json();
    const tableBody = document.getElementById('attendanceTableBody');

    tableBody.innerHTML = ''; // Clear existing rows

    attendanceRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

const name = document.getElementById('employeeName');

// async function nameUpdate() {
//     const employeeId = localStorage.getItem('employeeId');
//     console.log('Stored employeeId:', employeeId);

//     if (!employeeId) {
//         console.error('No employee ID found in localStorage');
//         name.innerHTML = 'Error: Not logged in';
//         return;
//     }

//     try {
//         console.log('Fetching name for employee ID:', employeeId);
//         // const response = await fetch(`http://localhost:3001/get-name?employeeId=${employeeId}`);
        
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || `Server responded with status: ${response.status}`);
//         }
        
//         const employeeData = await response.json();
//         console.log('Response from server:', employeeData);
        
//         if (employeeData && employeeData.name) {
//             name.innerHTML = employeeData.name;
//         } else {
//             console.error('Employee data does not contain name property:', employeeData);
//             name.innerHTML = 'Employee Name Not Found';
//         }
//     } catch (error) {
//         console.error('Error fetching employee name:', error);
//         name.innerHTML = 'Error Loading Name';
//     }
// }

// Call nameUpdate only if the element exists and we have an employeeId
// if (name && localStorage.getItem('employeeId')) {
//     nameUpdate();
// }

// Add event listener for "View Attendance"
document.getElementById('viewAttendance').addEventListener('click', async function() {
    const response = await fetch(`http://localhost:3001/get-attendance?employeeId=${employeeId}`);
    const attendanceRecords = await response.json();
    const tableBody = document.getElementById('attendanceTableBody');

    tableBody.innerHTML = ''; // Clear existing rows

    attendanceRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.status}</td>
        `;
        tableBody.appendChild(row);
    });

    // Show the attendance records modal
    const attendanceModal = new bootstrap.Modal(document.getElementById('attendanceModal'));
    attendanceModal.show();
});

// Add event listener for "View Department"
document.getElementById('viewDepartment').addEventListener('click', async function() {
    const employeeId = localStorage.getItem('employeeId'); // Fetch employeeId from local storage

    if (employeeId) {
        const response = await fetch(`http://localhost:3001/get-department/${employeeId}`);

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
    console.log('Department Info:', info); // Debug log
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

// Add this code in your employee-dashboard.js

document.getElementById('salaryHistoryButton').addEventListener('click', async function() {
    const employeeId = localStorage.getItem('employeeId'); // Fetch employeeId from local storage

    if (employeeId) {
        const response = await fetch(`http://localhost:3001/get-salary-history?employeeId=${employeeId}`);

        if (response.ok) {
            const salaryHistory = await response.json();
            displaySalaryHistory(salaryHistory);
        } else {
            const errorMessage = await response.text();
            alert('Error: ' + errorMessage);
        }
    } else {
        alert("Employee ID is required.");
    }
});

function displaySalaryHistory(salaryHistory) {
    const tableBody = document.getElementById('salaryHistoryTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    salaryHistory.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.base_salary}</td>
            <td>${record.income_tax}</td>
            <td>${record.PF}</td>
            <td>${record.LWP}</td>
            <td>${record.totalDeduction}</td>
            <td>${record.payroll_month}</td>
            <td>${record.payroll_year}</td>
        `;
        tableBody.appendChild(row);
    });

    // Show the salary history modal
    const salaryHistoryModal = new bootstrap.Modal(document.getElementById('salaryHistoryModal'));
    salaryHistoryModal.show();
}

window.onload = function () {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) return;

    fetch(`http://localhost:3001/get-name/${employeeId}`)
        .then(response => response.json())
        .then(data => {
            if (data.name) {
                localStorage.setItem('employeeName', data.name);
                console.log("Name stored:", data.name);
                // You can also update UI like:
                document.getElementById("employeeName").innerText = `Welcome, ${data.name}`;
            } else {
                console.error("No name returned");
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
};

// Function to ensure we have a valid employee ID
function getEmployeeId() {
    const storedId = localStorage.getItem('employeeId');
    if (!storedId) {
        console.error('No employee ID found in localStorage');
        return null;
    }
    return parseInt(storedId, 10);
}

// Function to update all employee details
async function updateEmployeeDetails() {
    const employeeId = getEmployeeId();
    if (!employeeId) {
        console.error('Cannot fetch employee details: No employee ID available');
        document.getElementById('employeeName').innerHTML = 'Error: Not logged in';
        document.getElementById('employeeDepartment').innerHTML = 'Error: Not logged in';
        document.getElementById('employeePosition').innerHTML = 'Error: Not logged in';
        return;
    }

    try {
        console.log('Fetching details for employee ID:', employeeId);
        const response = await fetch(`http://localhost:3001/get-department/${employeeId}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
        }
        
        const employeeData = await response.json();
        console.log('Employee details from server:', employeeData);
        
        // displayDepartmentInfo(employeeData);
        // Update employee name
        if (employeeData.name) {
            document.getElementById('employeeName').innerHTML = employeeData.name;
        }
        
        // Update department
        if (employeeData.department_name) {
            document.getElementById('employeeDepartment').innerHTML = employeeData.department_name;
            document.getElementById('position2').innerText = employeeData.position;
        }
        
        // Update position
        if (employeeData.position) {
            document.getElementById('employeePosition').innerHTML = employeeData.position;
            // document.getElementById('position2').innerText = employeeData.position;
        }
    } catch (error) {
        console.error('Error fetching employee details:', error);
        document.getElementById('employeeName').innerHTML = 'Error loading details';
        document.getElementById('employeeDepartment').innerHTML = 'Error loading details';
        document.getElementById('employeePosition').innerHTML = 'Error loading details';
    }
}

// Call the function to update employee details
updateEmployeeDetails();

// Function to update attendance count
async function updateAttendanceCount() {
    try {
        const response = await fetch(`http://localhost:3001/get-attendance?employeeId=${employeeId}`);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const attendanceRecords = await response.json();
        console.log('Attendance records:', attendanceRecords);
        
        // Count present days
        const presentDays = attendanceRecords.filter(record => record.status === 'Present').length;
        
        // Update the attendance count in the DOM
        document.getElementById('attendanceCount').innerHTML = `${presentDays} Days`;
    } catch (error) {
        console.error('Error fetching attendance count:', error);
        document.getElementById('attendanceCount').innerHTML = 'Error';
    }
}

// Call the function to update attendance count
updateAttendanceCount();

// Function to update salary information
async function updateSalaryInfo() {
    try {
        const response = await fetch(`http://localhost:3001/get-salary-history?employeeId=${employeeId}`);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const salaryHistory = await response.json();
        console.log('Salary history:', salaryHistory);
        
        if (salaryHistory && salaryHistory.length > 0) {
            // Get the most recent salary record
            const latestSalary = salaryHistory[salaryHistory.length - 1];
            
            // Update the base salary in the DOM
            document.getElementById('baseSalary').innerHTML = `$${latestSalary.base_salary}`;
            
            // Update the payroll month
            const monthNames = ["January", "February", "March", "April", "May", "June", 
                               "July", "August", "September", "October", "November", "December"];
            const monthName = monthNames[latestSalary.payroll_month - 1];
            document.getElementById('payrollMonth').innerHTML = monthName;
        } else {
            document.getElementById('baseSalary').innerHTML = 'Not Available';
            document.getElementById('payrollMonth').innerHTML = 'Not Available';
        }
    } catch (error) {
        console.error('Error fetching salary information:', error);
        document.getElementById('baseSalary').innerHTML = 'Error';
        document.getElementById('payrollMonth').innerHTML = 'Error';
    }
}

// Call the function to update salary information
updateSalaryInfo();

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
        console.error('No employee ID found, redirecting to login');
        window.location.href = '/index.html';
        return;
    }
    
    // Call all update functions
    updateEmployeeDetails();
    updateAttendanceCount();
    updateSalaryInfo();
});

document.getElementById('viewEmployeesButton').addEventListener('click', function() {
    const employeeIdModal = new bootstrap.Modal(document.getElementById('employeeIdModal'));
    employeeIdModal.show();
});