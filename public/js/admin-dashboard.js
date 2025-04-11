document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM Content Loaded');
    
    const salaryPaymentForm = document.getElementById('salaryPaymentForm');
    const submitBtnSalary = document.getElementById('submitBtnSalary');
    
    console.log('📝 Salary Payment Form:', salaryPaymentForm);
    console.log('🔘 Submit Button:', submitBtnSalary);
    
    if (salaryPaymentForm) {
        salaryPaymentForm.addEventListener('submit', async function(e) {
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
        submitBtnSalary.addEventListener('click', function(e) {
            console.log('🔘 Submit button clicked');
            if (salaryPaymentForm) {
                salaryPaymentForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    document.getElementById('addEmployeeForm').addEventListener('submit', async function(event) {
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
    document.getElementById('removeEmployeeForm').addEventListener('submit', async function(event) {
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
    document.getElementById('viewAttendanceHistory').addEventListener('click', function() {
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
            row.innerHTML = '<td colspan="3" class="text-center">No attendance records found</td>';
            tableBody.appendChild(row);
            return;
        }

        // Add header row with employee name if available
        if (records.length > 0 && records[0].employeeName) {
            const headerRow = document.createElement('tr');
            headerRow.className = 'table-primary';
            headerRow.innerHTML = `<td colspan="3" class="text-center"><strong>Attendance Records for ${records[0].employeeName}</strong></td>`;
            tableBody.appendChild(headerRow);
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

    // Handle attendance filter form submission
    document.getElementById('attendanceFilterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const employeeId = document.getElementById('attendanceEmployeeId').value;
        const month = document.getElementById('attendanceMonth').value;
        const year = document.getElementById('attendanceYear').value;
        
        if (!employeeId) {
            alert('Please enter an Employee ID');
            return;
        }
        
        try {
            console.log('🔍 Fetching attendance records for employee ID:', employeeId, 'Month:', month, 'Year:', year);
            const response = await fetch(`http://localhost:3001/get-attendance-by-month?employeeId=${employeeId}&month=${month}&year=${year}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Server error:', errorText);
                throw new Error(errorText);
            }
            
            const data = await response.json();
            console.log('📊 Attendance records:', data);
            
            if (data.success) {
                const tableBody = document.getElementById('attendanceTableBody');
                tableBody.innerHTML = '';
                
                if (data.records.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="2" class="text-center">No attendance records found for the selected criteria</td></tr>';
                } else {
                    data.records.forEach(record => {
                        const row = document.createElement('tr');
                        const date = new Date(record.date);
                        const formattedDate = date.toLocaleDateString('en-US', { 
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
                }
            } else {
                alert(data.message || 'Failed to fetch attendance records');
            }
        } catch (error) {
            console.error('❌ Error fetching attendance records:', error);
            alert('Error fetching attendance records: ' + error.message);
        }
    });

    console.log('Admin dashboard script loaded');
});
