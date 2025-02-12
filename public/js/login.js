// function handleEmployeeLogin(event) {
//     event.preventDefault();
    
//     // For now, just redirect to employee dashboard
//     window.location.href = 'employee-dashboard.html';
//     return false;
// }

async function handleEmployeeLogin(event) {
    event.preventDefault();
    const employeeId = document.querySelector('#employeeId').value;
    const password = document.querySelector('#employeePassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: employeeId, password })
    });

    if (response.ok) {
        const data = await response.json();
        // Redirect based on role
        if (data.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'employee-dashboard.html';
        }
    } else {
        const errorMessage = await response.text();
        showAlert(errorMessage, 'danger');
    }
}

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