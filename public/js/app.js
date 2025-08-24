// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let charts = {};

// DOM elements
let elements = {};

function initializeElements() {
    elements = {
        // Welcome screen elements
        welcomeScreen: document.getElementById('welcome-screen'),
        mainApp: document.getElementById('main-app'),
        showLoginBtn: document.getElementById('show-login'),
        showSignupBtn: document.getElementById('show-signup'),
        switchToLogin: document.getElementById('switch-to-login'),
        switchToSignup: document.getElementById('switch-to-signup'),
        loginFormContainer: document.getElementById('login-form-container'),
        signupFormContainer: document.getElementById('signup-form-container'),
        
        // Navigation
        navMenu: document.getElementById('nav-menu'),
        navLinks: document.querySelectorAll('.nav-link'),
        hamburger: document.getElementById('hamburger'),
        userName: document.getElementById('user-name'),
        
        // Auth buttons
        logoutBtn: document.getElementById('logout-btn'),
        
        // Forms
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        expenseForm: document.getElementById('expense-form'),
        profileForm: document.getElementById('profile-form'),
        
        // Sections
        sections: document.querySelectorAll('.section'),
        
        // Dashboard elements
        totalSpending: document.getElementById('total-spending'),
        categoryCount: document.getElementById('category-count'),
        potentialSavings: document.getElementById('potential-savings'),
        monthlySpending: document.getElementById('monthly-spending'),
        recentExpensesList: document.getElementById('recent-expenses-list'),
        
        // Expense elements
        addExpenseBtn: document.getElementById('add-expense-btn'),
        addExpenseForm: document.getElementById('add-expense-form'),
        cancelExpense: document.getElementById('cancel-expense'),
        expensesList: document.getElementById('expenses-list'),
        searchExpenses: document.getElementById('search-expenses'),
        filterCategory: document.getElementById('filter-category'),
        filterDate: document.getElementById('filter-date'),
        
        // Loading
        loading: document.getElementById('loading')
    };
}

// API configuration
const API_BASE = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeElements();
    checkAuthStatus();
    
    if (authToken) {
        showMainApp();
        setupNavigation();
        setupEventListeners();
        loadDashboard();
    } else {
        showWelcomeScreen();
        setupWelcomeEventListeners();
    }
}

// Welcome Screen Functions
function showWelcomeScreen() {
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'flex';
    }
    if (elements.mainApp) {
        elements.mainApp.style.display = 'none';
    }
}

function showMainApp() {
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'none';
    }
    if (elements.mainApp) {
        elements.mainApp.style.display = 'block';
    }
}

function setupWelcomeEventListeners() {
    // Welcome screen auth buttons
    if (elements.showLoginBtn) {
        elements.showLoginBtn.addEventListener('click', () => showAuthForm('login'));
    }
    if (elements.showSignupBtn) {
        elements.showSignupBtn.addEventListener('click', () => showAuthForm('signup'));
    }
    
    // Form switching
    if (elements.switchToLogin) {
        elements.switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('login');
        });
    }
    if (elements.switchToSignup) {
        elements.switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('signup');
        });
    }
    
    // Forms
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
}

function showAuthForm(type) {
    if (type === 'login') {
        if (elements.loginFormContainer) {
            elements.loginFormContainer.classList.add('active');
        }
        if (elements.signupFormContainer) {
            elements.signupFormContainer.classList.remove('active');
        }
    } else {
        if (elements.signupFormContainer) {
            elements.signupFormContainer.classList.add('active');
        }
        if (elements.loginFormContainer) {
            elements.loginFormContainer.classList.remove('active');
        }
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    if (elements.navLinks) {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });
    }
    
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Auth buttons
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
    
    // Forms
    if (elements.expenseForm) {
        elements.expenseForm.addEventListener('submit', handleAddExpense);
    }
    if (elements.profileForm) {
        elements.profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Expense management
    if (elements.addExpenseBtn) {
        elements.addExpenseBtn.addEventListener('click', toggleExpenseForm);
    }
    if (elements.cancelExpense) {
        elements.cancelExpense.addEventListener('click', toggleExpenseForm);
    }
    if (elements.searchExpenses) {
        elements.searchExpenses.addEventListener('input', filterExpenses);
    }
    if (elements.filterCategory) {
        elements.filterCategory.addEventListener('change', filterExpenses);
    }
    if (elements.filterDate) {
        elements.filterDate.addEventListener('change', filterExpenses);
    }
    
    // Set default date for expense form
    const expenseDate = document.getElementById('expense-date');
    if (expenseDate) {
        expenseDate.value = new Date().toISOString().split('T')[0];
    }
}

// Navigation Functions
function setupNavigation() {
    // Handle hash changes
    window.addEventListener('hashchange', handleNavigation);
    
    // Set initial active section
    const hash = window.location.hash || '#dashboard';
    showSection(hash.substring(1));
}

function handleNavigation(e) {
    e.preventDefault();
    const target = e.target.getAttribute('href').substring(1);
    showSection(target);
    
    // Update URL
    window.location.hash = target;
    
    // Update active nav link
    elements.navLinks.forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
    
    // Load section data
    if (authToken) {
        switch(target) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'expenses':
                loadExpenses();
                break;
            case 'analytics':
                loadAnalytics();
                break;
            case 'optimization':
                loadOptimization();
                break;
            case 'profile':
                loadProfile();
                break;
        }
    }
}

function showSection(sectionId) {
    elements.sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function toggleMobileMenu() {
    elements.navMenu.classList.toggle('active');
}

// Modal Functions (Legacy - kept for compatibility)
function showModal(modal) {
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeAllModals() {
    // Legacy function - no longer needed with new design
}

// Authentication Functions
async function checkAuthStatus() {
    if (authToken) {
        try {
            const response = await apiCall('GET', '/users/profile');
            if (response.success) {
                currentUser = response.data;
                updateAuthUI(true);
            } else {
                logout();
            }
        } catch (error) {
            logout();
        }
    } else {
        updateAuthUI(false);
    }
}

async function getUserProfile() {
    try {
        const response = await apiCall('GET', '/users/profile');
        if (response.success) {
            currentUser = response.data;
        }
    } catch (error) {
        console.error('Failed to get user profile:', error);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };
    
    try {
        const response = await apiCall('POST', '/users/login', formData);
        if (response.success) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            await getUserProfile();
            updateAuthUI(true);
            loadDashboard();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(response.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value
    };
    
    try {
        const response = await apiCall('POST', '/users/register', formData);
        if (response.success) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            await getUserProfile();
            updateAuthUI(true);
            loadDashboard();
            showNotification('Registration successful!', 'success');
        } else {
            showNotification(response.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateAuthUI(false);
    showSection('dashboard');
    showNotification('Logged out successfully', 'success');
}

function updateAuthUI(isLoggedIn) {
    if (isLoggedIn) {
        showMainApp();
        if (currentUser && elements.userName) {
            elements.userName.textContent = currentUser.name;
        }
        // Setup main app functionality
        setupNavigation();
        setupEventListeners();
    } else {
        showWelcomeScreen();
        setupWelcomeEventListeners();
    }
}

// API Functions
async function apiCall(method, endpoint, data = null) {
    const url = API_BASE + endpoint;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (authToken) {
        options.headers['x-auth-token'] = authToken;
    }
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (response.ok) {
            return { success: true, data: result };
        } else {
            return { success: false, message: result.message || 'Request failed' };
        }
    } catch (error) {
        console.error('API call error:', error);
        return { success: false, message: 'Network error' };
    }
}

// Dashboard Functions
async function loadDashboard() {
    if (!authToken) return;
    
    showLoading();
    try {
        const [expensesResponse, summaryResponse, savingsResponse] = await Promise.all([
            apiCall('GET', '/costs'),
            apiCall('GET', '/costs/summary'),
            apiCall('GET', '/optimization/savings-potential')
        ]);
        
        if (expensesResponse.success) {
            updateDashboardStats(expensesResponse.data, summaryResponse.data, savingsResponse.data);
            updateRecentExpenses(expensesResponse.data);
            createCategoryChart(summaryResponse.data);
        }
    } catch (error) {
        console.error('Dashboard loading error:', error);
    } finally {
        hideLoading();
    }
}

function updateDashboardStats(expenses, summary, savings) {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryCount = summary.length;
    const potentialSavings = savings.success ? parseFloat(savings.data.potentialSavings) : 0;
    
    // Calculate monthly spending
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTotal = expenses
        .filter(expense => expense.date.startsWith(currentMonth))
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    elements.totalSpending.textContent = `$${total.toFixed(2)}`;
    elements.categoryCount.textContent = categoryCount;
    elements.potentialSavings.textContent = `$${potentialSavings.toFixed(2)}`;
    elements.monthlySpending.textContent = `$${monthlyTotal.toFixed(2)}`;
}

function updateRecentExpenses(expenses) {
    const recentExpenses = expenses.slice(0, 5);
    
    if (recentExpenses.length === 0) {
        elements.recentExpensesList.innerHTML = '<p class="no-data">No expenses recorded yet</p>';
        return;
    }
    
    const expensesHTML = recentExpenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <h4>${expense.title}</h4>
                <p>${expense.category}</p>
            </div>
            <div class="expense-amount">
                <span>$${expense.amount.toFixed(2)}</span>
                <small>${new Date(expense.date).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
    
    elements.recentExpensesList.innerHTML = expensesHTML;
}

// Chart Functions
function createCategoryChart(summaryData) {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    if (charts.categoryChart) {
        charts.categoryChart.destroy();
    }
    
    const labels = summaryData.map(item => item._id);
    const data = summaryData.map(item => item.total);
    
    charts.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c',
                    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
                    '#fa709a', '#fee140', '#a8edea', '#fed6e3'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Expense Functions
function toggleExpenseForm() {
    const isVisible = elements.addExpenseForm.style.display !== 'none';
    elements.addExpenseForm.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        elements.expenseForm.reset();
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    }
}

async function handleAddExpense(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        title: document.getElementById('expense-title').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        category: document.getElementById('expense-category').value,
        date: document.getElementById('expense-date').value,
        description: document.getElementById('expense-description').value
    };
    
    try {
        const response = await apiCall('POST', '/costs', formData);
        if (response.success) {
            showNotification('Expense added successfully!', 'success');
            toggleExpenseForm();
            loadDashboard();
            loadExpenses();
        } else {
            showNotification(response.message || 'Failed to add expense', 'error');
        }
    } catch (error) {
        showNotification('Failed to add expense. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function loadExpenses() {
    if (!authToken) return;
    
    showLoading();
    try {
        const response = await apiCall('GET', '/costs');
        if (response.success) {
            displayExpenses(response.data);
            populateCategoryFilter(response.data);
        }
    } catch (error) {
        console.error('Expenses loading error:', error);
    } finally {
        hideLoading();
    }
}

function displayExpenses(expenses) {
    if (expenses.length === 0) {
        elements.expensesList.innerHTML = '<p class="no-data">No expenses found</p>';
        return;
    }
    
    const expensesHTML = expenses.map(expense => `
        <div class="expense-card" data-id="${expense._id}">
            <div class="expense-header">
                <h4>${expense.title}</h4>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="editExpense('${expense._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteExpense('${expense._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="expense-details">
                <span class="category">${expense.category}</span>
                <span class="amount">$${expense.amount.toFixed(2)}</span>
                <span class="date">${new Date(expense.date).toLocaleDateString()}</span>
            </div>
            ${expense.description ? `<p class="description">${expense.description}</p>` : ''}
        </div>
    `).join('');
    
    elements.expensesList.innerHTML = expensesHTML;
}

function populateCategoryFilter(expenses) {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    elements.filterCategory.innerHTML = '<option value="">All Categories</option>' +
        categories.map(category => `<option value="${category}">${category}</option>`).join('');
}

function filterExpenses() {
    // This would implement client-side filtering
    // For now, just reload expenses
    loadExpenses();
}

// Analytics Functions
async function loadAnalytics() {
    if (!authToken) return;
    
    showLoading();
    try {
        const [expensesResponse, analysisResponse] = await Promise.all([
            apiCall('GET', '/costs'),
            apiCall('GET', '/optimization/analysis')
        ]);
        
        if (expensesResponse.success) {
            createTrendChart(expensesResponse.data);
            createPieChart(analysisResponse.data.categoryAnalysis);
            updateAnalyticsSummary(analysisResponse.data);
        }
    } catch (error) {
        console.error('Analytics loading error:', error);
    } finally {
        hideLoading();
    }
}

function createTrendChart(expenses) {
    const ctx = document.getElementById('trend-chart');
    if (!ctx) return;
    
    if (charts.trendChart) {
        charts.trendChart.destroy();
    }
    
    // Group expenses by month
    const monthlyData = expenses.reduce((acc, expense) => {
        const month = expense.date.slice(0, 7);
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
    }, {});
    
    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(month => monthlyData[month]);
    
    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Spending',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createPieChart(categoryAnalysis) {
    const ctx = document.getElementById('pie-chart');
    if (!ctx) return;
    
    if (charts.pieChart) {
        charts.pieChart.destroy();
    }
    
    const labels = Object.keys(categoryAnalysis);
    const data = labels.map(category => categoryAnalysis[category].total);
    
    charts.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c',
                    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateAnalyticsSummary(data) {
    const summaryContainer = document.getElementById('analytics-summary-content');
    
    if (!data.totalSpending) {
        summaryContainer.innerHTML = '<p class="no-data">No data available for analysis</p>';
        return;
    }
    
    const summaryHTML = `
        <div class="summary-stats">
            <div class="summary-item">
                <h4>Total Spending</h4>
                <p>$${data.totalSpending.toFixed(2)}</p>
            </div>
            <div class="summary-item">
                <h4>Categories</h4>
                <p>${Object.keys(data.categoryAnalysis).length}</p>
            </div>
            <div class="summary-item">
                <h4>Recommendations</h4>
                <p>${data.recommendations.length}</p>
            </div>
        </div>
    `;
    
    summaryContainer.innerHTML = summaryHTML;
}

// Optimization Functions
async function loadOptimization() {
    if (!authToken) return;
    
    showLoading();
    try {
        const [analysisResponse, savingsResponse] = await Promise.all([
            apiCall('GET', '/optimization/analysis'),
            apiCall('GET', '/optimization/savings-potential')
        ]);
        
        if (analysisResponse.success) {
            displayRecommendations(analysisResponse.data.recommendations);
            displaySavingsPotential(savingsResponse.data);
        }
    } catch (error) {
        console.error('Optimization loading error:', error);
    } finally {
        hideLoading();
    }
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-list');
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p class="no-data">No recommendations available</p>';
        return;
    }
    
    const recommendationsHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="recommendation-icon">
                <i class="fas fa-lightbulb"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.type.replace('_', ' ').toUpperCase()}</h4>
                <p>${rec.suggestion}</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = recommendationsHTML;
}

function displaySavingsPotential(data) {
    const container = document.getElementById('savings-potential-content');
    
    if (!data.potentialSavings) {
        container.innerHTML = '<p class="no-data">No savings data available</p>';
        return;
    }
    
    const savingsHTML = `
        <div class="savings-overview">
            <div class="savings-total">
                <h4>Potential Savings</h4>
                <p class="savings-amount">$${data.potentialSavings}</p>
                <small>${data.savingsPercentage}% of current spending</small>
            </div>
        </div>
        <div class="savings-strategies">
            <h4>Savings Strategies</h4>
            ${data.suggestions.map(suggestion => `
                <div class="strategy-item">
                    <h5>${suggestion.strategy}</h5>
                    <p>Potential savings: $${suggestion.savings}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = savingsHTML;
}

// Profile Functions
async function loadProfile() {
    if (!authToken) return;
    
    showLoading();
    try {
        const response = await apiCall('GET', '/users/profile');
        if (response.success) {
            displayUserInfo(response.data);
        }
    } catch (error) {
        console.error('Profile loading error:', error);
    } finally {
        hideLoading();
    }
}

function displayUserInfo(user) {
    const container = document.getElementById('user-info');
    
    const userHTML = `
        <div class="user-details">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.email}</p>
                <small>Member since ${new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
    `;
    
    container.innerHTML = userHTML;
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        currency: document.getElementById('profile-currency').value,
        timezone: document.getElementById('profile-timezone').value
    };
    
    try {
        const response = await apiCall('PUT', '/users/profile', formData);
        if (response.success) {
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification(response.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Utility Functions
function showLoading() {
    elements.loading.style.display = 'flex';
}

function hideLoading() {
    elements.loading.style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 4000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
