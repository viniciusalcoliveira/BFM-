// Function to handle dropdown menus
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.relative.group');
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('div[role="menu"]');
        if (button && menu) {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
                menu.classList.toggle('hidden', isExpanded);
            });
        }
    });
}

// Function to handle logout
function logout() {
    localStorage.removeItem('logado');
    window.location.href = 'login.html';
}

// Function to handle dynamic alerts (bell icon) - not implemented, just placeholder
function updateAlerts() {
    const alertCountElement = document.getElementById('alertCount');
    const alertListElement = document.getElementById('alertList');
    // Example: fetch alerts from a backend or local storage
    const alerts = []; // Empty for now

    if (alerts.length > 0) {
        alertCountElement.textContent = alerts.length;
        alertCountElement.style.display = 'block';
        alertListElement.innerHTML = alerts.map(alert => `<div class="p-2 border-b last:border-b-0">${alert.message}</div>`).join('');
    } else {
        alertCountElement.style.display = 'none';
        alertListElement.innerHTML = '<p class="text-sm text-gray-500">Nenhum alerta no momento.</p>';
    }
}

// Run the setup functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    setupDropdowns();
    updateAlerts();
});