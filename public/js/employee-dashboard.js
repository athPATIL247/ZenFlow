// Assuming you have a way to get the employee ID, e.g., from local storage or a hidden input
const employeeId = parseInt(localStorage.getItem('employeeId'),10); // or however you store it
console.log('Employee ID:', employeeId); // Debug log
const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format// Function to update attendance table

async function updateAttendanceTable() {
    const response = await fetch(`/get-attendance?employeeId=${employeeId}`);
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
    const response = await fetch('/mark-attendance', {
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
    const response = await fetch(`/get-attendance?employeeId=${employeeId}`);
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

// Add event listener for "View Attendance"
document.getElementById('viewAttendance').addEventListener('click', async function() {
    const response = await fetch(`/get-attendance?employeeId=${employeeId}`);
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