// Employee Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get employee ID from localStorage
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
        alert('You need to login first!');
        window.location.href = 'index.html';
        return;
    }

    console.log('🔄 Employee Dashboard loaded for employee ID:', employeeId);
    
    // Set current date in the dashboard
    const currentDate = new Date();
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Populate the year dropdown for the calendar
    populateYearDropdown();
    
    // Set defaults for month and year in the calendar
    document.getElementById('calendarMonth').value = currentDate.getMonth() + 1;
    document.getElementById('calendarYear').value = currentDate.getFullYear();

    // Initialize the dashboard
    loadEmployeeProfile();
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
});

function populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('calendarYear');
    
    // Clear existing options
    yearSelect.innerHTML = '';
    
    // Add options for the past 2 years plus the current year
    for (let year = currentYear - 2; year <= currentYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    yearSelect.value = currentYear; // Set current year as default
}

function setupEventListeners() {
    // Navigation menu event listeners
    document.getElementById('dashboardNavLink').addEventListener('click', function() {
        showSection('dashboardSection');
        loadDashboardData();
    });
    
    document.getElementById('markAttendanceBtn').addEventListener('click', function() {
        showSection('attendanceSection');
        checkAndMarkAttendance();
    });
    
    document.getElementById('viewAttendanceBtn').addEventListener('click', function() {
        showSection('attendanceHistorySection');
        loadAttendanceHistory();
    });
    
    document.getElementById('viewSalaryBtn').addEventListener('click', function() {
        showSection('salaryHistorySection');
        loadSalaryHistory();
    });
    
    document.getElementById('viewProfileBtn').addEventListener('click', function() {
        showSection('profileSection');
    });
    
    // Quick mark attendance button on dashboard
    document.getElementById('quickMarkAttendanceBtn').addEventListener('click', function() {
        markTodayAttendance();
    });
    
    // Calendar refresh button
    document.getElementById('refreshCalendarBtn').addEventListener('click', function() {
        const month = document.getElementById('calendarMonth').value;
        const year = document.getElementById('calendarYear').value;
        loadAttendanceCalendar(month, year);
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-container');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update the active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to the clicked nav link
    switch(sectionId) {
        case 'dashboardSection':
            document.getElementById('dashboardNavLink').classList.add('active');
            break;
        case 'attendanceSection':
            document.getElementById('markAttendanceBtn').classList.add('active');
            break;
        case 'attendanceHistorySection':
            document.getElementById('viewAttendanceBtn').classList.add('active');
            break;
        case 'salaryHistorySection':
            document.getElementById('viewSalaryBtn').classList.add('active');
            break;
        case 'profileSection':
            document.getElementById('viewProfileBtn').classList.add('active');
            break;
    }
}

async function loadDashboardData() {
    try {
        const employeeId = localStorage.getItem('employeeId');
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        // Load data in parallel for better performance
        await Promise.all([
            loadMonthlyStats(employeeId, currentMonth, currentYear),
            checkTodayAttendance(employeeId),
            loadAttendanceCalendar(currentMonth, currentYear),
            loadRecentActivity(employeeId)
        ]);
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

async function loadMonthlyStats(employeeId, month, year) {
    try {
        console.log('🔍 Fetching monthly stats with params:', { employeeId, month, year });
        
        const response = await fetch(`http://localhost:3001/monthly-stats?employeeId=${employeeId}&month=${month}&year=${year}`);
        const data = await response.json();
        
        console.log('📊 Monthly stats API response:', data);
        
        if (data.success) {
            const stats = data.stats;
            
            // Update statistics cards with additional debug
            console.log('Updating stats cards with values:', {
                presentDays: stats.presentDays || 0,
                absentDays: stats.absentDays || 0,
                totalWorkHours: stats.totalWorkHours || 0,
                attendanceRate: stats.attendanceRate || 0
            });
            
            // Update statistics cards
            document.getElementById('presentDaysCount').textContent = stats.presentDays || 0;
            document.getElementById('absentDaysCount').textContent = stats.absentDays || 0;
            document.getElementById('workingHoursCount').textContent = stats.totalWorkHours || 0;
            document.getElementById('attendanceRateCount').textContent = stats.attendanceRate ? `${stats.attendanceRate}%` : '0%';
            
            return stats;
        } else {
            console.error('❌ Error fetching monthly stats:', data.message);
            
            // Still update UI with zeros instead of leaving empty
            document.getElementById('presentDaysCount').textContent = '0';
            document.getElementById('absentDaysCount').textContent = '0';
            document.getElementById('workingHoursCount').textContent = '0';
            document.getElementById('attendanceRateCount').textContent = '0%';
            
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching monthly stats:', error);
        
        // Still update UI with zeros
        document.getElementById('presentDaysCount').textContent = '0';
        document.getElementById('absentDaysCount').textContent = '0';
        document.getElementById('workingHoursCount').textContent = '0';
        document.getElementById('attendanceRateCount').textContent = '0%';
        
        return null;
    }
}

async function checkTodayAttendance(employeeId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`http://localhost:3001/check-attendance?employeeId=${employeeId}&date=${today}`);
        const data = await response.json();
        
        const todayAttendanceContainer = document.getElementById('todayAttendanceContainer');
        
        if (data.attendanceMarked) {
            todayAttendanceContainer.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Attendance marked for today!</strong>
                    <p class="mb-0">You have successfully marked your attendance for today.</p>
                </div>
            `;
        } else {
            todayAttendanceContainer.innerHTML = `
                <div class="text-center py-4" id="markAttendanceContainer">
                    <h5 class="mb-3">You haven't marked attendance for today</h5>
                    <button class="btn btn-mark-attendance" id="quickMarkAttendanceBtn">
                        <i class="fas fa-calendar-check me-2"></i>Mark Attendance
                    </button>
                </div>
            `;
            
            // Reattach the event listener
            document.getElementById('quickMarkAttendanceBtn').addEventListener('click', function() {
                markTodayAttendance();
            });
        }
    } catch (error) {
        console.error('❌ Error checking today attendance:', error);
    }
}

async function loadAttendanceCalendar(month, year) {
    try {
        const employeeId = localStorage.getItem('employeeId');
        const response = await fetch(`http://localhost:3001/attendance-overview?employeeId=${employeeId}&month=${month}&year=${year}`);
        const data = await response.json();
        
        if (data.success) {
            const overview = data.overview;
            const calendarContainer = document.getElementById('attendanceCalendarContainer');
            
            // Generate the calendar
            calendarContainer.innerHTML = generateCalendar(month, year, overview.attendance);
            
            // Update the summary
            document.getElementById('totalWorkingDays').textContent = overview.totalWorkingDays;
            document.getElementById('monthPresentDays').textContent = overview.presentDays;
            document.getElementById('monthAbsentDays').textContent = overview.absentDays;
            document.getElementById('monthAttendanceRate').textContent = overview.attendancePercentage;
        } else {
            console.error('❌ Error fetching attendance overview:', data.message);
        }
    } catch (error) {
        console.error('❌ Error loading attendance calendar:', error);
    }
}

function generateCalendar(month, year, attendanceData) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
    
    // Create a map of attendance data by date
    const attendanceMap = {};
    if (attendanceData) {
        attendanceData.forEach(record => {
            const date = new Date(record.date).getDate();
            attendanceMap[date] = record.status;
        });
    }
    
    // Start building the calendar
    let calendarHTML = `
        <div class="calendar-container">
            <div class="calendar-header">Sun</div>
            <div class="calendar-header">Mon</div>
            <div class="calendar-header">Tue</div>
            <div class="calendar-header">Wed</div>
            <div class="calendar-header">Thu</div>
            <div class="calendar-header">Fri</div>
            <div class="calendar-header">Sat</div>
    `;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day"></div>`;
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const status = attendanceMap[day];
        const statusClass = status === 'Present' ? 'present' : status === 'Absent' ? 'absent' : '';
        const statusIcon = status === 'Present' ? '<i class="fas fa-check-circle icon-present"></i>' : 
                           status === 'Absent' ? '<i class="fas fa-times-circle icon-absent"></i>' : '';
        
        calendarHTML += `
            <div class="calendar-day ${statusClass}">
                <span>${day}</span>
                ${statusIcon ? `<div>${statusIcon}</div>` : ''}
            </div>
        `;
    }
    
    // Close the calendar container
    calendarHTML += `</div>`;
    
    return calendarHTML;
}

async function loadRecentActivity(employeeId) {
    try {
        const response = await fetch(`http://localhost:3001/recent-activity?employeeId=${employeeId}`);
        const data = await response.json();
        
        if (data.success) {
            const activities = data.activities;
            const recentActivityContainer = document.getElementById('recentActivityContainer');
            
            if (activities.length === 0) {
                recentActivityContainer.innerHTML = '<p class="text-center text-muted">No recent activities</p>';
                return;
            }
            
            let activityHTML = '';
            
            activities.forEach(activity => {
                const date = new Date(activity.timestamp);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                const activityIcon = activity.type === 'attendance' ? 
                    '<i class="fas fa-calendar-check activity-icon attendance-icon"></i>' : 
                    '<i class="fas fa-money-bill-alt activity-icon salary-icon"></i>';
                
                activityHTML += `
                    <div class="activity-item">
                        ${activityIcon}
                        <div class="activity-content">
                            <div class="activity-description">${activity.description}</div>
                            <div class="activity-time">${formattedDate}</div>
                        </div>
                    </div>
                `;
            });
            
            recentActivityContainer.innerHTML = activityHTML;
        } else {
            console.error('❌ Error fetching recent activity:', data.message);
        }
    } catch (error) {
        console.error('❌ Error loading recent activity:', error);
    }
}

async function checkAndMarkAttendance() {
    const employeeId = localStorage.getItem('employeeId');
    const today = new Date().toISOString().split('T')[0];
    const attendanceStatus = document.getElementById('attendanceStatus');
    
    try {
        // Check if attendance is already marked
        const checkResponse = await fetch(`http://localhost:3001/check-attendance?employeeId=${employeeId}&date=${today}`);
        const checkData = await checkResponse.json();
        
        if (checkData.attendanceMarked) {
            attendanceStatus.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Attendance already marked for today!</strong>
                    <p class="mb-0">You have already marked your attendance for today.</p>
                </div>
            `;
        } else {
            attendanceStatus.innerHTML = `
                <div class="text-center py-4">
                    <h5 class="mb-3">You haven't marked attendance for today</h5>
                    <button class="btn btn-mark-attendance" id="markAttendanceInSection">
                        <i class="fas fa-calendar-check me-2"></i>Mark Attendance
                    </button>
                </div>
            `;
            
            document.getElementById('markAttendanceInSection').addEventListener('click', function() {
                markTodayAttendance();
            });
        }
    } catch (error) {
        console.error('❌ Error checking attendance:', error);
        attendanceStatus.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>Error checking attendance status</strong>
                <p class="mb-0">There was an error checking your attendance status. Please try again later.</p>
            </div>
        `;
    }
}

async function markTodayAttendance() {
    const employeeId = localStorage.getItem('employeeId');
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch('http://localhost:3001/mark-attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employeeId,
                date: today
            })
        });
        
        if (response.ok) {
            // Show success message
            alert('Attendance marked successfully!');
            
            // Refresh the dashboard data
            loadDashboardData();
            
            // If we're on the attendance section, update that too
            if (document.getElementById('attendanceSection').classList.contains('active')) {
                checkAndMarkAttendance();
            }
        } else {
            const errorText = await response.text();
            console.error('❌ Error marking attendance:', errorText);
            alert('Failed to mark attendance: ' + errorText);
        }
    } catch (error) {
        console.error('❌ Error marking attendance:', error);
        alert('Failed to mark attendance. Please try again later.');
    }
}

async function loadAttendanceHistory() {
    try {
        const employeeId = localStorage.getItem('employeeId');
        const response = await fetch(`http://localhost:3001/get-attendance?employeeId=${employeeId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch attendance records');
        }
        
        const records = await response.json();
        const tableBody = document.getElementById('attendanceHistoryTable');
        tableBody.innerHTML = '';
        
        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2" class="text-center">No attendance records found</td></tr>';
            return;
        }
        
        records.forEach(record => {
            const row = document.createElement('tr');
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
            
            const statusClass = record.status === 'Present' ? 'text-success' : 'text-danger';
            const statusIcon = record.status === 'Present' ? 
                '<i class="fas fa-check-circle me-2"></i>' : 
                '<i class="fas fa-times-circle me-2"></i>';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td class="${statusClass}">${statusIcon}${record.status}</td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('❌ Error loading attendance history:', error);
        alert('Failed to load attendance history. Please try again later.');
    }
}

async function loadSalaryHistory() {
    try {
        const employeeId = localStorage.getItem('employeeId');
        const response = await fetch(`http://localhost:3001/get-salary-history?employeeId=${employeeId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch salary history');
        }
        
        const data = await response.json();
        const tableBody = document.getElementById('salaryHistoryTable');
        tableBody.innerHTML = '';
        
        if (!data.length) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No salary records found</td></tr>';
            return;
        }
        
        // Map month number to month name
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        data.forEach(record => {
            const row = document.createElement('tr');
            const monthName = months[record.payroll_month - 1];
            const baseSalary = parseFloat(record.base_salary);
            const totalDeduction = parseFloat(record.totalDeduction || 0);
            const netSalary = baseSalary - totalDeduction;
            
            row.innerHTML = `
                <td>${monthName}</td>
                <td>${record.payroll_year}</td>
                <td>₹${baseSalary.toFixed(2)}</td>
                <td>₹${totalDeduction.toFixed(2)}</td>
                <td>₹${netSalary.toFixed(2)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('❌ Error loading salary history:', error);
        alert('Failed to load salary history. Please try again later.');
    }
}

async function loadEmployeeProfile() {
    try {
        const employeeId = localStorage.getItem('employeeId');
        console.log('🔍 Loading profile for employee ID:', employeeId);
        
        const response = await fetch(`http://localhost:3001/get-employee?employeeId=${employeeId}`);
        console.log('📊 Profile API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch employee profile: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Profile data:', data);
        
        if (data.success) {
            const employee = data.employee;
            
            // Update employee name in the navbar
            document.getElementById('employeeNameDisplay').textContent = `Welcome, ${employee.name}!`;
            
            // Update profile info with all available employee data
            const profileInfo = document.getElementById('profileInfo');
            
            // Format the date in a more readable format
            const joinDate = new Date(employee.date_joined);
            const formattedJoinDate = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Create a more comprehensive profile display
            profileInfo.innerHTML = `
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-4">
                            <div class="avatar-placeholder bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3" style="width: 80px; height: 80px; font-size: 2rem;">
                                ${employee.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="mb-0">${employee.name}</h4>
                                <p class="text-muted mb-0">${employee.position}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-id-card me-2"></i>Basic Information</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Employee ID:</strong> ${employee.id}</p>
                                <p><strong>Full Name:</strong> ${employee.name}</p>
                                <p><strong>Position:</strong> ${employee.position}</p>
                                <p><strong>Date Joined:</strong> ${formattedJoinDate}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-building me-2"></i>Department Information</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Department ID:</strong> ${employee.department_id}</p>
                                <p><strong>Department Name:</strong> ${employee.department_name || 'Not assigned'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            console.error('❌ Error fetching employee profile:', data.message);
            document.getElementById('profileInfo').innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <strong>Error loading profile data</strong>
                    <p>Unable to load your profile information. Please try again later.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error loading employee profile:', error);
        document.getElementById('profileInfo').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>Error loading profile</strong>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function showError(message) {
    alert(message); // Simple error handling using alert for now
}