// ==================== AUTHENTICATION SYSTEM ====================

const Auth = {
    // Current user state
    currentUser: null,
    isAuthenticated: false,
    
    // Initialize auth system
    init() {
        this.loadSession();
        this.setupListeners();
    },
    
    // Load session from storage
    loadSession() {
        try {
            const session = localStorage.getItem('auth_session');
            if(session) {
                const data = JSON.parse(session);
                if(data.expires > Date.now()) {
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    console.log('Session restored:', this.currentUser);
                } else {
                    this.clearSession();
                }
            }
        } catch(error) {
            console.error('Error loading session:', error);
            this.clearSession();
        }
    },
    
    // Setup event listeners
    setupListeners() {
        // Listen for auth state changes
        window.addEventListener('storage', (e) => {
            if(e.key === 'auth_session') {
                this.loadSession();
            }
        });
    },
    
    // Admin login
    async adminLogin(username, password) {
        // Simple validation
        if(username === 'admin' && password === 'admin123') {
            const user = {
                id: 'admin',
                username: 'admin',
                role: 'admin',
                name: 'System Administrator',
                permissions: ['all']
            };
            
            await this.createSession(user);
            return { success: true, user };
        }
        
        return { success: false, error: 'Invalid credentials' };
    },
    
    // Review mode login
    async reviewLogin(password) {
        // Default review password
        if(password === 'review123') {
            const user = {
                id: 'review',
                username: 'review',
                role: 'review',
                name: 'Review User',
                permissions: ['view_results', 'view_answers']
            };
            
            await this.createSession(user);
            return { success: true, user };
        }
        
        return { success: false, error: 'Invalid review password' };
    },
    
    // Create session
    async createSession(user) {
        const session = {
            user: user,
            token: this.generateToken(),
            expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('auth_session', JSON.stringify(session));
        
        // Update state
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Dispatch event
        this.dispatchAuthChange();
        
        console.log('Session created:', user);
        return session;
    },
    
    // Generate simple token
    generateToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);
    },
    
    // Check permission
    hasPermission(permission) {
        if(!this.currentUser) return false;
        if(this.currentUser.permissions?.includes('all')) return true;
        return this.currentUser.permissions?.includes(permission);
    },
    
    // Check role
    hasRole(role) {
        return this.currentUser?.role === role;
    },
    
    // Get user info
    getUser() {
        return this.currentUser;
    },
    
    // Logout
    logout() {
        this.clearSession();
        this.dispatchAuthChange();
        console.log('User logged out');
    },
    
    // Clear session
    clearSession() {
        localStorage.removeItem('auth_session');
        this.currentUser = null;
        this.isAuthenticated = false;
    },
    
    // Dispatch auth change event
    dispatchAuthChange() {
        const event = new CustomEvent('authchange', {
            detail: { user: this.currentUser, isAuthenticated: this.isAuthenticated }
        });
        window.dispatchEvent(event);
    },
    
    // Check if session is valid
    isSessionValid() {
        if(!this.isAuthenticated) return false;
        
        try {
            const session = localStorage.getItem('auth_session');
            if(!session) return false;
            
            const data = JSON.parse(session);
            return data.expires > Date.now();
        } catch {
            return false;
        }
    },
    
    // Require auth middleware
    requireAuth(requiredRole = null) {
        if(!this.isSessionValid()) {
            return { allowed: false, redirect: 'login' };
        }
        
        if(requiredRole && !this.hasRole(requiredRole)) {
            return { allowed: false, redirect: 'unauthorized' };
        }
        
        return { allowed: true };
    },
    
    // Update user profile
    updateProfile(updates) {
        if(!this.currentUser) return false;
        
        this.currentUser = { ...this.currentUser, ...updates };
        
        // Update session
        const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
        session.user = this.currentUser;
        localStorage.setItem('auth_session', JSON.stringify(session));
        
        this.dispatchAuthChange();
        return true;
    },
    
    // Change password
    async changePassword(currentPassword, newPassword) {
        // For demo, just check if current password matches
        if(currentPassword === 'admin123') {
            // In real app, hash and save new password
            console.log('Password changed successfully');
            return { success: true };
        }
        
        return { success: false, error: 'Current password is incorrect' };
    }
};

// Initialize auth on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Export to window
window.Auth = Auth;