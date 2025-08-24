// Authentication JavaScript for Login and Signup pages

// API configuration
const API_BASE = '/api';

// DOM elements
let elements = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
});

function initializeAuthPage() {
    // Get common elements
    elements = {
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        loading: document.getElementById('loading'),
        notificationContainer: document.getElementById('notification-container')
    };

    // Setup event listeners
    setupEventListeners();
    
    // Add password strength indicator if on signup page
    if (elements.signupForm) {
        setupPasswordStrength();
    }
    
    // Check if user is already authenticated
    checkAuthStatus();
}

function setupEventListeners() {
    // Login form
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form  
    if (elements.signupForm) {
        elements.signupForm.addEventListener('submit', handleSignup);
        
        // Password confirmation validation
        const confirmPassword = document.getElementById('confirm-password');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', validatePasswordMatch);
        }
    }
    
    // Social login buttons (placeholder)
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', handleSocialLogin);
    });
}

function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            
            strengthFill.style.width = `${strength.percentage}%`;
            strengthText.textContent = strength.text;
            strengthText.style.color = strength.color;
        });
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 25;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) score += 25;
    else feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    
    let text, color;
    if (score < 30) {
        text = 'Weak password';
        color = '#f56565';
    } else if (score < 60) {
        text = 'Fair password';
        color = '#ed8936';
    } else if (score < 90) {
        text = 'Good password';
        color = '#ecc94b';
    } else {
        text = 'Strong password';
        color = '#48bb78';
    }
    
    return { percentage: Math.min(score, 100), text, color };
}

function validatePasswordMatch() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    
    if (password && confirmPassword) {
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Passwords do not match');
            confirmPassword.style.borderColor = '#f56565';
        } else {
            confirmPassword.setCustomValidity('');
            confirmPassword.style.borderColor = '#e2e8f0';
        }
    }
}

async function checkAuthStatus() {
    // Don't check auth status if we're already on the dashboard
    if (window.location.pathname === '/dashboard') {
        return;
    }
    
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        try {
            const response = await apiCall('GET', '/auth/profile');
            if (response.success) {
                // User is already authenticated, redirect to dashboard
                window.location.href = '/dashboard';
                return;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading();
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await apiCall('POST', '/auth/login', loginData);
        
        if (response.success) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userData', JSON.stringify(response.data.user));
            showNotification('Login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showNotification(response.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    // Validate password match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    showLoading();
    
    const formData = new FormData(e.target);
    const signupData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        apiKey: formData.get('apiKey')
    };
    
    try {
        const response = await apiCall('POST', '/auth/register', signupData);
        
        if (response.success) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userData', JSON.stringify(response.data.user));
            showNotification('Account created successfully! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showNotification(response.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function handleSocialLogin(e) {
    e.preventDefault();
    showNotification('Social login will be available soon!', 'info');
}

// API call helper function
async function apiCall(method, endpoint, data = null) {
    const url = API_BASE + endpoint;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const token = localStorage.getItem('authToken');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (response.ok) {
            // Handle both direct response and wrapped response formats
            if (result.success !== undefined) {
                return result; // Already in correct format
            } else {
                return { success: true, data: result };
            }
        } else {
            return { success: false, message: result.message || 'Request failed' };
        }
    } catch (error) {
        console.error('API call error:', error);
        return { success: false, message: 'Network error' };
    }
}

// Utility functions
function showLoading() {
    if (elements.loading) {
        elements.loading.style.display = 'flex';
    }
}

function hideLoading() {
    if (elements.loading) {
        elements.loading.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Style the notification
    const styles = {
        success: '#48bb78',
        error: '#f56565',
        warning: '#ed8936',
        info: '#4299e1'
    };
    
    notification.style.cssText = `
        background: ${styles[type] || styles.info};
        color: white;
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 1rem;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
    `;
    
    // Add to container
    if (elements.notificationContainer) {
        elements.notificationContainer.appendChild(notification);
    } else {
        // Fallback: add to body
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '400px';
        document.body.appendChild(notification);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
    }
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Add notification animation styles
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification-content span {
        flex: 1;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }
    
    .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
