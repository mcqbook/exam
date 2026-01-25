// ==================== STORAGE MANAGEMENT ====================

const Storage = {
    // Prefix for all keys
    prefix: 'mrstylo_',
    
    // Get item
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch(error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    // Set item
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch(error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    // Remove item
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch(error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    // Clear all app data
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if(key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch(error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },
    
    // Get all keys
    keys() {
        try {
            const allKeys = Object.keys(localStorage);
            return allKeys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch(error) {
            console.error('Storage keys error:', error);
            return [];
        }
    },
    
    // Get all data
    getAll() {
        try {
            const data = {};
            const keys = this.keys();
            
            keys.forEach(key => {
                data[key] = this.get(key);
            });
            
            return data;
        } catch(error) {
            console.error('Storage getAll error:', error);
            return {};
        }
    },
    
    // Check if key exists
    has(key) {
        return localStorage.getItem(this.prefix + key) !== null;
    },
    
    // Exam data methods
    exams: {
        // Get all exams
        getAll() {
            return Storage.get('exams', []);
        },
        
        // Get exam by id
        getById(id) {
            const exams = Storage.get('exams', []);
            return exams.find(exam => exam.id === id);
        },
        
        // Save exam
        save(exam) {
            const exams = Storage.get('exams', []);
            const existingIndex = exams.findIndex(e => e.id === exam.id);
            
            if(existingIndex >= 0) {
                exams[existingIndex] = exam;
            } else {
                exams.push(exam);
            }
            
            Storage.set('exams', exams);
            return exam;
        },
        
        // Delete exam
        delete(id) {
            const exams = Storage.get('exams', []);
            const filtered = exams.filter(exam => exam.id !== id);
            Storage.set('exams', filtered);
            return filtered;
        },
        
        // Count exams
        count() {
            return Storage.get('exams', []).length;
        }
    },
    
    // Results data methods
    results: {
        // Get all results
        getAll() {
            return Storage.get('results', []);
        },
        
        // Save result
        save(result) {
            const results = Storage.get('results', []);
            results.push({
                ...result,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            });
            
            Storage.set('results', results);
            return result;
        },
        
        // Get results by exam
        getByExam(examId) {
            const results = Storage.get('results', []);
            return results.filter(result => result.examId === examId);
        },
        
        // Delete result
        delete(id) {
            const results = Storage.get('results', []);
            const filtered = results.filter(result => result.id !== id);
            Storage.set('results', filtered);
            return filtered;
        },
        
        // Clear all results
        clear() {
            Storage.set('results', []);
            return true;
        }
    },
    
    // Categories data methods
    categories: {
        // Get all categories
        getAll() {
            return Storage.get('categories', [
                { id: 'general', name: 'General', count: 0 }
            ]);
        },
        
        // Save category
        save(category) {
            const categories = Storage.get('categories', []);
            
            if(category.id) {
                const index = categories.findIndex(c => c.id === category.id);
                if(index >= 0) {
                    categories[index] = category;
                } else {
                    categories.push(category);
                }
            } else {
                category.id = 'cat_' + Date.now();
                categories.push(category);
            }
            
            Storage.set('categories', categories);
            return category;
        },
        
        // Delete category
        delete(id) {
            const categories = Storage.get('categories', []);
            const filtered = categories.filter(cat => cat.id !== id);
            Storage.set('categories', filtered);
            return filtered;
        }
    },
    
    // User preferences
    preferences: {
        // Get preferences
        get() {
            return Storage.get('preferences', {
                theme: 'light',
                language: 'bn',
                fontSize: 'medium',
                notifications: true,
                sound: true,
                autoSave: true
            });
        },
        
        // Update preferences
        update(updates) {
            const current = Storage.get('preferences', {});
            const updated = { ...current, ...updates };
            Storage.set('preferences', updated);
            return updated;
        },
        
        // Get specific preference
        getItem(key, defaultValue) {
            const prefs = Storage.get('preferences', {});
            return prefs[key] !== undefined ? prefs[key] : defaultValue;
        },
        
        // Set specific preference
        setItem(key, value) {
            const prefs = Storage.get('preferences', {});
            prefs[key] = value;
            Storage.set('preferences', prefs);
            return value;
        }
    },
    
    // Analytics data
    analytics: {
        // Track event
        track(event, data = {}) {
            const analytics = Storage.get('analytics', []);
            analytics.push({
                event,
                data,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
            
            // Keep only last 1000 events
            if(analytics.length > 1000) {
                analytics.splice(0, analytics.length - 1000);
            }
            
            Storage.set('analytics', analytics);
        },
        
        // Get events
        getEvents(filter = {}) {
            let events = Storage.get('analytics', []);
            
            if(filter.event) {
                events = events.filter(e => e.event === filter.event);
            }
            
            if(filter.startDate) {
                events = events.filter(e => new Date(e.timestamp) >= new Date(filter.startDate));
            }
            
            if(filter.endDate) {
                events = events.filter(e => new Date(e.timestamp) <= new Date(filter.endDate));
            }
            
            return events;
        },
        
        // Clear analytics
        clear() {
            Storage.set('analytics', []);
            return true;
        }
    },
    
    // Backup and restore
    backup: {
        // Create backup
        create() {
            const data = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: Storage.getAll()
            };
            
            return data;
        },
        
        // Restore from backup
        restore(backupData) {
            if(!backupData.data) {
                throw new Error('Invalid backup format');
            }
            
            // Clear existing data
            Storage.clearAll();
            
            // Restore data
            Object.keys(backupData.data).forEach(key => {
                Storage.set(key, backupData.data[key]);
            });
            
            return true;
        },
        
        // Export as file
        exportToFile(filename = 'mrstylo_backup.json') {
            const backup = this.create();
            const dataStr = JSON.stringify(backup, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
            return true;
        },
        
        // Import from file
        importFromFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        this.restore(backup);
                        resolve(true);
                    } catch(error) {
                        reject(new Error('Invalid backup file'));
                    }
                };
                
                reader.onerror = () => {
                    reject(new Error('Error reading file'));
                };
                
                reader.readAsText(file);
            });
        }
    }
};

// Export to window
window.Storage = Storage;