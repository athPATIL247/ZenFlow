// function handleEmployeeLogin(event) {
//     event.preventDefault();

//     // For now, just redirect to employee dashboard
//     window.location.href = 'employee-dashboard.html';
//     return false;
// }

// async function handleEmployeeLogin(event) {
//     event.preventDefault();
//     const employeeId = document.querySelector('#employeeId').value;
//     const password = document.querySelector('#employeePassword').value;

//     const response = await fetch('/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username: employeeId, password })
//     });

//     if (response.ok) {
//         const data = await response.json();
//         console.log('Login response:', data); // Debug log
//         localStorage.setItem('employeeId', data.employeeId);
//         if (data.role === 'admin') {
//             window.location.href = 'admin-dashboard.html';
//         } else {
//             window.location.href = 'employee-dashboard.html';
//         }
//     } else {
//         const errorMessage = await response.text();
//         showAlert(errorMessage, 'danger');
//     }
// }
// document.getElementById('employeeLoginBtn').addEventListener('submit', handleEmployeeLogin);

async function handleEmployeeLogin(event) {
    event.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value;
    const password = document.getElementById('employeePassword').value;

    if (!employeeId || !password) {
        showAlert('Please enter both Employee ID and Password', 'danger');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: employeeId, 
                password: password 
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            
            // Store employee ID in localStorage
            localStorage.setItem('employeeId', data.employeeId);
            
            // Redirect based on role
            if (data.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'employee-dashboard.html';
            }
        } else {
            const errorText = await response.text();
            showAlert(errorText || 'Invalid credentials', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Error during login. Please try again.', 'danger');
    }
}

// Function to show alerts
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Find the form and insert the alert before it
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(alertDiv, form);

    // Automatically remove the alert after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Add event listener to the form
document.getElementById('loginForm').addEventListener('submit', handleEmployeeLogin);

async function handleAdminLogin(event) {
    event.preventDefault();

    const username = document.querySelector('#adminUsername').value;
    const password = document.querySelector('#adminPassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        window.location.href = 'admin-dashboard.html';
    } else {
        const errorMessage = await response.text();
        showAlert(errorMessage, 'danger');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const loginCard = document.querySelector('.login-card');
    loginCard.insertBefore(alertDiv, loginCard.querySelector('.text-center'));

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
} 
