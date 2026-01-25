// ==================== UTILITY FUNCTIONS ====================

// Format Date
function formatDate(date) {
    return new Date(date).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format Time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate Unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Validate Email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate Password
function isValidPassword(password) {
    return password.length >= 6;
}

// Sanitize Input
function sanitizeInput(input) {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Copy to Clipboard
function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

// Download File
function downloadFile(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Read File
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

// Parse JSON Safely
function parseJSON(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON parse error:', error);
        return defaultValue;
    }
}

// Stringify JSON Safely
function stringifyJSON(data, defaultValue = '{}') {
    try {
        return JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('JSON stringify error:', error);
        return defaultValue;
    }
}

// Get Query Parameter
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Set Query Parameter
function setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

// Remove Query Parameter
function removeQueryParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
}

// Detect Mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detect Touch
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Get Screen Size
function getScreenSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024
    };
}

// Capitalize First Letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate Text
function truncate(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Generate Random Number
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle Array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Deep Clone Object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Merge Objects
function mergeObjects(...objects) {
    return objects.reduce((merged, obj) => ({ ...merged, ...obj }), {});
}

// Format Number with Commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate Percentage
function calculatePercentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
}

// Sleep/Delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate Random Color
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

// Check if Online
function isOnline() {
    return navigator.onLine;
}

// Get Browser Info
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    return {
        browser,
        version: ua.match(/(Chrome|Firefox|Safari|Edge)\/([0-9.]+)/)?.[2] || 'Unknown',
        isChrome: ua.includes('Chrome'),
        isFirefox: ua.includes('Firefox'),
        isSafari: ua.includes('Safari') && !ua.includes('Chrome'),
        isEdge: ua.includes('Edge')
    };
}

// Get Device Info
function getDeviceInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio
    };
}

// Export all functions
window.utils = {
    formatDate,
    formatTime,
    generateId,
    debounce,
    throttle,
    isValidEmail,
    isValidPassword,
    sanitizeInput,
    copyToClipboard,
    downloadFile,
    readFile,
    parseJSON,
    stringifyJSON,
    getQueryParam,
    setQueryParam,
    removeQueryParam,
    isMobile,
    isTouchDevice,
    getScreenSize,
    capitalize,
    truncate,
    randomInt,
    shuffleArray,
    deepClone,
    mergeObjects,
    formatNumber,
    calculatePercentage,
    sleep,
    randomColor,
    isOnline,
    getBrowserInfo,
    getDeviceInfo
};