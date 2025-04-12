document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 DOM Content Loaded');

    // Initialize dashboard components
    loadDashboardOverview();
    setupEventListeners();

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
                // alert('Error recording salary payment: ' + error.message);
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
    document.getElementById('viewEmployeesButton').addEventListener('click', async function (){
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
            
            // Also update the summary counts to zero
            document.getElementById('totalWorkingDaysCount').textContent = '0';
            document.getElementById('presentDaysCount').textContent = '0';
            document.getElementById('absentDaysCount').textContent = '0';
            document.getElementById('attendanceRateDisplay').textContent = '0%';
            
            return;
        }

        // Count present and absent days
        let presentDays = 0;
        let absentDays = 0;
        
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
            const statusIcon = record.status === 'Present' ? 
                '<i class="fas fa-check-circle me-2"></i>' : 
                '<i class="fas fa-times-circle me-2"></i>';

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td class="${statusClass}">${statusIcon}${record.status}</td>
            `;
            tableBody.appendChild(row);
            
            // Update counters
            if (record.status === 'Present') {
                presentDays++;
            } else if (record.status === 'Absent') {
                absentDays++;
            }
        });

        // Update the attendance summary
        const totalDays = presentDays + absentDays;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        document.getElementById('totalWorkingDaysCount').textContent = totalDays;
        document.getElementById('presentDaysCount').textContent = presentDays;
        document.getElementById('absentDaysCount').textContent = absentDays;
        document.getElementById('attendanceRateDisplay').textContent = `${attendanceRate}%`;
        
        // Generate and display the attendance calendar
        generateAttendanceCalendar(records);

        // Show the attendance records section
        document.getElementById('attendanceRecordsSection').style.display = 'block';
    }

    // Function to generate a visual attendance calendar
    function generateAttendanceCalendar(records) {
        const calendarContainer = document.getElementById('attendanceCalendar');
        
        // If no records, show a message
        if (!records.length) {
            calendarContainer.innerHTML = '<div class="text-center text-muted">No attendance data available</div>';
            return;
        }
        
        // Get the month and year from the first record or use current month
        const firstDate = records.length ? new Date(records[0].date) : new Date();
        const month = firstDate.getMonth();
        const year = firstDate.getFullYear();
        
        // Create a map of dates to status for easier lookup
        const attendanceMap = {};
        records.forEach(record => {
            const date = new Date(record.date);
            // Store date as day key (1-31)
            attendanceMap[date.getDate()] = record.status;
        });
        
        // Get number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get the starting day of the month (0 = Sunday, 1 = Monday, etc.)
        const firstDay = new Date(year, month, 1).getDay();
        
        // Create the calendar HTML
        let calendarHTML = `
            <div class="calendar-header mb-2">
                <div class="month-year">${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
        `;
        
        // Add empty cells for the days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            // Create a date object for the current day
            const currentDate = new Date(year, month, day);
            // Get day of week (0 = Sunday, 6 = Saturday)
            const dayOfWeek = currentDate.getDay();
            
            let dayClass = 'calendar-day';
            let statusIndicator = '';
            let status = attendanceMap[day];
            
            // If it's a weekday (Monday-Friday) and no attendance record exists, mark as Absent
            // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            if (dayOfWeek > 0 && dayOfWeek < 6 && status === undefined) {
                status = 'Absent';
                // Add a note that this is auto-marked
                statusIndicator = '<i class="fas fa-times-circle text-danger"></i><small class="auto-marked">(Auto)</small>';
                dayClass += ' absent auto-marked';
            } 
            // If status is present from records
            else if (status === 'Present') {
                statusIndicator = '<i class="fas fa-check-circle text-success"></i>';
                dayClass += ' present';
            } 
            // If status is absent from records
            else if (status === 'Absent') {
                statusIndicator = '<i class="fas fa-times-circle text-danger"></i>';
                dayClass += ' absent';
            }
            // Weekend days (Saturday/Sunday) with no records - mark with a different style
            else if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayClass += ' weekend';
            }
            
            // Add special styling for weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayClass += ' weekend';
            }
            
            calendarHTML += `
                <div class="${dayClass}">
                    <div class="day-number">${day}</div>
                    <div class="status-indicator">${statusIndicator}</div>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        // Add CSS for the calendar
        calendarHTML += `
            <style>
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 5px;
                }
                .calendar-day-header {
                    font-weight: bold;
                    text-align: center;
                    padding: 5px;
                    background-color: #f5f5f5;
                }
                .calendar-day {
                    min-height: 40px;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 5px;
                    text-align: center;
                }
                .calendar-day.empty {
                    background-color: transparent;
                    border: none;
                }
                .calendar-day.present {
                    background-color: #e8f5e9;
                }
                .calendar-day.absent {
                    background-color: #ffebee;
                }
                .calendar-day.weekend {
                    background-color: #f3f3f3;
                    color: #999;
                }
                .calendar-day.auto-marked {
                    background-color: #ffe0e0;
                }
                .month-year {
                    font-weight: bold;
                    font-size: 1.2em;
                    text-align: center;
                    margin-bottom: 10px;
                }
                .day-number {
                    font-weight: bold;
                }
                .auto-marked {
                    display: block;
                    font-size: 0.7em;
                    color: #666;
                }
            </style>
        `;
        
        calendarContainer.innerHTML = calendarHTML;
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

// Load dashboard overview data
async function loadDashboardOverview() {
    console.log('📊 Loading dashboard overview data');
    
    try {
        // Fetch total employees count
        const employeesResponse = await fetch('/view-employees');
        const employees = await employeesResponse.json();
        document.getElementById('totalEmployeesCount').textContent = employees.length;
        
        // Fetch departments and count them
        const departmentsResponse = await fetch('/view-departments');
        const departments = await departmentsResponse.json();
        const departmentCount = Object.keys(departments).length;
        document.getElementById('totalDepartmentsCount').textContent = departmentCount;
        
        // Set current month
        const currentDate = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonthDisplay').textContent = monthNames[currentDate.getMonth()];
        
        // Count today's attendance (will need a new endpoint for this)
        const todayDate = currentDate.toISOString().split('T')[0];
        try {
            const attendanceResponse = await fetch(`/get-today-attendance-count?date=${todayDate}`);
            if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                document.getElementById('todayAttendanceCount').textContent = attendanceData.count;
            } else {
                // If endpoint doesn't exist yet, show a placeholder
                document.getElementById('todayAttendanceCount').textContent = '—';
            }
        } catch (error) {
            // If endpoint doesn't exist yet, show a placeholder
            console.log('⚠️ Today attendance count endpoint not available yet');
            document.getElementById('todayAttendanceCount').textContent = '—';
        }
        
        console.log('✅ Dashboard overview data loaded');
    } catch (error) {
        console.error('❌ Error loading dashboard overview:', error);
    }
}

// Set up event listeners for dashboard navigation
function setupEventListeners() {
    // Dashboard overview button
    const dashboardOverviewBtn = document.getElementById('dashboardOverviewBtn');
    if (dashboardOverviewBtn) {
        dashboardOverviewBtn.addEventListener('click', function() {
            showSection('dashboardOverview');
            loadDashboardOverview();
        });
    }
    
    // Analytics dashboard button
    const analyticsDashboardBtn = document.getElementById('analyticsDashboardBtn');
    if (analyticsDashboardBtn) {
        analyticsDashboardBtn.addEventListener('click', function() {
            showSection('analyticsDashboardSection');
            initializeAnalyticsDashboard();
        });
    }
    
    // Make dashboard view active by default
    dashboardOverviewBtn.click();
}

// Helper function to show/hide sections
function showSection(sectionId) {
    // Hide all main content sections
    const sections = [
        'dashboardOverview',
        'employeeTableSection',
        'attendanceRecordsSection',
        'analyticsDashboardSection'
    ];
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            if (section === 'dashboardOverview') {
                // Special case for dashboard overview - we always show it
                element.style.display = sectionId === 'dashboardOverview' ? 'block' : 'none';
            } else {
                element.style.display = section === sectionId ? 'block' : 'none';
            }
        }
    });
}

// Initialize the analytics dashboard
function initializeAnalyticsDashboard() {
    console.log('📊 Initializing analytics dashboard');
    
    // Fetch data for department distribution chart
    fetchDepartmentDistribution();
    
    // Fetch data for attendance trend chart
    fetchAttendanceTrends();
    
    // Fetch payroll summary data
    fetchPayrollSummary('current_month');
    
    // Add event listener for period selector
    const periodSelect = document.getElementById('analyticsPeriodSelect');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            fetchPayrollSummary(this.value);
        });
    }
}

// Fetch department distribution data and render chart
async function fetchDepartmentDistribution() {
    try {
        const response = await fetch('/view-departments');
        const departments = await response.json();
        
        // Process data for chart
        const departmentNames = [];
        const employeeCounts = [];
        
        for (const [id, department] of Object.entries(departments)) {
            departmentNames.push(department.name);
            employeeCounts.push(department.employees.length);
        }
        
        // Create chart
        const ctx = document.getElementById('departmentDistributionChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: departmentNames,
                datasets: [{
                    data: employeeCounts,
                    backgroundColor: [
                        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                        '#5a5c69', '#858796', '#f8f9fc', '#d1d3e2', '#b7b9cc'
                    ],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                const dataLabel = tooltipItem.label;
                                const value = tooltipItem.raw;
                                return `${dataLabel}: ${value} employees`;
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching department distribution:', error);
        document.getElementById('departmentDistributionChart').innerHTML = 
            '<div class="text-center text-danger">Failed to load department data</div>';
    }
}

// Fetch attendance trends data and render chart
async function fetchAttendanceTrends() {
    try {
        const response = await fetch('/get-attendance-trends');
        if (!response.ok) {
            throw new Error('Failed to fetch attendance trends');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch attendance trends');
        }
        
        const trends = data.trends;
        
        // If no data, use placeholder data
        if (!trends || trends.length === 0) {
            // Use placeholder data
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const presentRates = [90, 85, 88, 92, 89, 94];
            
            createAttendanceTrendChart(months, presentRates);
            return;
        }
        
        // Extract months and attendance rates
        const months = trends.map(item => item.month);
        const presentRates = trends.map(item => item.attendanceRate);
        
        createAttendanceTrendChart(months, presentRates);
        
    } catch (error) {
        console.error('❌ Error fetching attendance trends:', error);
        
        // Use placeholder data in case of error
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const presentRates = [90, 85, 88, 92, 89, 94];
        
        createAttendanceTrendChart(months, presentRates);
    }
}

// Helper function to create the attendance trend chart
function createAttendanceTrendChart(months, presentRates) {
    const ctx = document.getElementById('attendanceTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Attendance Rate (%)',
                data: presentRates,
                fill: false,
                borderColor: '#1cc88a',
                tension: 0.1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 100
                }
            }
        }
    });
}

// Fetch payroll summary data
async function fetchPayrollSummary(period) {
    try {
        const response = await fetch(`/get-payroll-summary?period=${period}`);
        if (!response.ok) {
            throw new Error('Failed to fetch payroll summary');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch payroll summary');
        }
        
        const summary = data.summary;
        
        // Format the currency values
        document.getElementById('totalSalaryPayout').textContent = formatCurrency(summary.total_salary || 0);
        document.getElementById('totalTaxDeductions').textContent = formatCurrency(summary.total_tax || 0);
        document.getElementById('totalPFContributions').textContent = formatCurrency(summary.total_pf || 0);
        document.getElementById('totalLWPDeductions').textContent = formatCurrency(summary.total_lwp || 0);
        
    } catch (error) {
        console.error('❌ Error fetching payroll summary:', error);
        
        // Use placeholder data based on the selected period
        let totalSalary, totalTax, totalPF, totalLWP;
        
        switch (period) {
            case 'current_month':
                totalSalary = 450000;
                totalTax = 45000;
                totalPF = 54000;
                totalLWP = 12500;
                break;
            case 'last_month':
                totalSalary = 448000;
                totalTax = 44800;
                totalPF = 53760;
                totalLWP = 15000;
                break;
            case 'last_3_months':
                totalSalary = 1350000;
                totalTax = 135000;
                totalPF = 162000;
                totalLWP = 42500;
                break;
            case 'year_to_date':
                totalSalary = 5400000;
                totalTax = 540000;
                totalPF = 648000;
                totalLWP = 156000;
                break;
            default:
                totalSalary = 0;
                totalTax = 0;
                totalPF = 0;
                totalLWP = 0;
        }
        
        // Format the currency values
        document.getElementById('totalSalaryPayout').textContent = formatCurrency(totalSalary);
        document.getElementById('totalTaxDeductions').textContent = formatCurrency(totalTax);
        document.getElementById('totalPFContributions').textContent = formatCurrency(totalPF);
        document.getElementById('totalLWPDeductions').textContent = formatCurrency(totalLWP);
    }
}

// Helper function to format currency
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}