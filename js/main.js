// ==================== MAIN APPLICATION ====================

// Global Variables
let currentView = 'dashboard';
let isAdmin = false;
let appSettings = {};
let categories = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mr. Stylo Academy loaded');
    initApp();
});

async function initApp() {
    // Load settings
    await loadSettings();
    
    // Load categories
    await loadCategories();
    
    // Show initial view
    showView('dashboard');
    
    // Initialize service worker
    initServiceWorker();
    
    // Check if admin session exists
    checkAdminSession();
}

// Load app settings
async function loadSettings() {
    try {
        // Try to load from localStorage
        const saved = localStorage.getItem('appSettings');
        if(saved) {
            appSettings = JSON.parse(saved);
        }
        
        // Default settings
        appSettings = {
            ...appSettings,
            theme: 'light',
            language: 'bn',
            notifications: true
        };
        
        console.log('Settings loaded:', appSettings);
    } catch(error) {
        console.error('Error loading settings:', error);
    }
}

// Load categories
async function loadCategories() {
    try {
        // For now, use default categories
        categories = [
            { id: 'all', name: 'All', count: 0 },
            { id: 'math', name: 'Mathematics', count: 0 },
            { id: 'science', name: 'Science', count: 0 },
            { id: 'english', name: 'English', count: 0 },
            { id: 'bangla', name: 'বাংলা', count: 0 }
        ];
        
        console.log('Categories loaded:', categories);
    } catch(error) {
        console.error('Error loading categories:', error);
    }
}

// Switch between views
function showView(viewName, params = {}) {
    currentView = viewName;
    const app = document.getElementById('app');
    
    switch(viewName) {
        case 'dashboard':
            app.innerHTML = renderDashboard();
            break;
        case 'admin':
            app.innerHTML = renderAdminPanel();
            break;
        case 'exam':
            app.innerHTML = renderExamView(params);
            break;
        case 'result':
            app.innerHTML = renderResultView(params);
            break;
        case 'login':
            app.innerHTML = renderLoginView();
            break;
        default:
            app.innerHTML = renderDashboard();
    }
    
    // Update active state
    updateActiveNav();
}

// Render Dashboard
function renderDashboard() {
    return `
        <div class="container">
            <div class="header">
                <h2>🎓 Mr. Stylo Academy</h2>
                <p>Premium Mock Test Platform</p>
            </div>
            
            <div class="p-20">
                <!-- Categories -->
                <div class="categories">
                    <h3 class="card-title">Categories</h3>
                    <div class="cat-scroll">
                        ${categories.map(cat => `
                            <div class="cat-chip" onclick="filterExams('${cat.id}')">
                                ${cat.name} (${cat.count})
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Exam List -->
                <div id="exam-list">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <p>Loading exams...</p>
                    </div>
                </div>
                
                <!-- Admin Login Button -->
                <button class="btn btn-outline mt-20" onclick="showView('login')">
                    👨‍🏫 Admin Login
                </button>
            </div>
        </div>
    `;
}

// Render Admin Panel
function renderAdminPanel() {
    if(!isAdmin) {
        return renderLoginView();
    }
    
    return `
        <div class="container">
            <div class="header">
                <h2>👨‍🏫 Admin Dashboard</h2>
                <p>System Management</p>
            </div>
            
            <div class="admin-dashboard">
                <!-- Stats -->
                <div class="admin-stats">
                    <div class="stat-card">
                        <div class="stat-label">Total Exams</div>
                        <div class="stat-value" id="total-exams">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Results</div>
                        <div class="stat-value" id="total-results">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Active Users</div>
                        <div class="stat-value" id="active-users">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Avg. Score</div>
                        <div class="stat-value" id="avg-score">0%</div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="admin-actions">
                    <div class="action-card" onclick="showView('create-exam')">
                        <div class="action-icon">📝</div>
                        <div class="action-title">Create Exam</div>
                    </div>
                    <div class="action-card" onclick="manageCategories()">
                        <div class="action-icon">🗂️</div>
                        <div class="action-title">Categories</div>
                    </div>
                    <div class="action-card" onclick="viewResults()">
                        <div class="action-icon">📊</div>
                        <div class="action-title">Results</div>
                    </div>
                    <div class="action-card" onclick="showSettings()">
                        <div class="action-icon">⚙️</div>
                        <div class="action-title">Settings</div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="card mt-20">
                    <h3 class="card-title">Recent Activity</h3>
                    <div id="recent-activity">
                        <p class="text-center">No recent activity</p>
                    </div>
                </div>
                
                <!-- Logout Button -->
                <button class="btn btn-danger mt-20" onclick="logoutAdmin()">
                    Logout
                </button>
            </div>
        </div>
    `;
}

// Render Login View
function renderLoginView() {
    return `
        <div class="container">
            <div class="header">
                <h2>🔐 Admin Login</h2>
                <p>Secure Access Required</p>
            </div>
            
            <div class="p-20">
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" id="admin-username" class="form-control" placeholder="Enter username">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="admin-password" class="form-control" placeholder="Enter password">
                    </div>
                    
                    <button class="btn btn-primary" onclick="loginAdmin()">
                        Login
                    </button>
                    
                    <button class="btn btn-outline mt-10" onclick="showView('dashboard')">
                        Back to Home
                    </button>
                </div>
                
                <div class="alert alert-info mt-20">
                    <strong>Default Credentials:</strong><br>
                    Username: admin<br>
                    Password: admin123
                </div>
            </div>
        </div>
    `;
}

// Admin Login Function
function loginAdmin() {
    const username = document.getElementById('admin-username')?.value || 'admin';
    const password = document.getElementById('admin-password')?.value || 'admin123';
    
    // Simple validation
    if(username === 'admin' && password === 'admin123') {
        isAdmin = true;
        localStorage.setItem('adminSession', 'active');
        showView('admin');
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

// Check Admin Session
function checkAdminSession() {
    const session = localStorage.getItem('adminSession');
    if(session === 'active') {
        isAdmin = true;
    }
}

// Logout Admin
function logoutAdmin() {
    isAdmin = false;
    localStorage.removeItem('adminSession');
    showView('dashboard');
    showNotification('Logged out successfully', 'success');
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '300px';
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize Service Worker
function initServiceWorker() {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Error:', err));
    }
}

// Update Navigation Active State
function updateActiveNav() {
    // Implementation depends on your navigation structure
}

// Filter Exams by Category
function filterExams(categoryId) {
    console.log('Filtering by category:', categoryId);
    // Implementation
}

// Export functions to window
window.showView = showView;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.filterExams = filterExams;