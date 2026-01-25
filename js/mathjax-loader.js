// ==================== MATHJAX LOADER ====================

const MathJaxLoader = {
    isLoaded: false,
    isLoading: false,
    queue: [],
    
    // Initialize MathJax
    init() {
        if (typeof MathJax === 'undefined') {
            this.loadMathJax();
        } else {
            this.isLoaded = true;
            this.processQueue();
        }
    },
    
    // Load MathJax script
    loadMathJax() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        
        script.onload = () => {
            this.isLoaded = true;
            this.isLoading = false;
            this.setupMathJax();
            this.processQueue();
            console.log('MathJax loaded successfully');
        };
        
        script.onerror = () => {
            console.error('Failed to load MathJax');
            this.isLoading = false;
        };
        
        document.head.appendChild(script);
    },
    
    // Setup MathJax configuration
    setupMathJax() {
        if (typeof MathJax === 'undefined') return;
        
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true,
                packages: ['base', 'ams', 'noerrors', 'noundefined']
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                ignoreHtmlClass: 'tex-ignore',
                processHtmlClass: 'tex-process'
            },
            startup: {
                pageReady: () => {
                    return MathJax.startup.defaultPageReady();
                }
            },
            svg: {
                fontCache: 'global'
            }
        };
    },
    
    // Render math elements
    render(element = null) {
        if (!this.isLoaded) {
            this.queue.push(element);
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.isLoaded) {
                        clearInterval(checkInterval);
                        this.renderElement(element).then(resolve);
                    }
                }, 100);
            });
        }
        
        return this.renderElement(element);
    },
    
    // Render specific element
    renderElement(element) {
        return new Promise((resolve, reject) => {
            if (typeof MathJax === 'undefined') {
                reject(new Error('MathJax not loaded'));
                return;
            }
            
            try {
                if (element) {
                    // Render specific element
                    MathJax.typesetPromise([element])
                        .then(() => resolve())
                        .catch(err => {
                            console.warn('MathJax render warning:', err);
                            resolve(); // Resolve anyway to prevent blocking
                        });
                } else {
                    // Render entire document
                    MathJax.typesetPromise()
                        .then(() => resolve())
                        .catch(err => {
                            console.warn('MathJax render warning:', err);
                            resolve(); // Resolve anyway to prevent blocking
                        });
                }
            } catch (error) {
                console.error('MathJax render error:', error);
                resolve(); // Always resolve to prevent blocking UI
            }
        });
    },
    
    // Process queued elements
    processQueue() {
        if (this.queue.length === 0) return;
        
        console.log(`Processing ${this.queue.length} queued math elements`);
        
        const promises = this.queue.map(element => this.render(element));
        Promise.all(promises).then(() => {
            this.queue = [];
        });
    },
    
    // Convert LaTeX to HTML (for preview)
    latexToHtml(latex, isInline = true) {
        const wrapper = document.createElement('div');
        wrapper.style.display = isInline ? 'inline' : 'block';
        wrapper.textContent = isInline ? `$${latex}$` : `$$${latex}$$`;
        
        this.render(wrapper).then(() => {
            // Render complete
        });
        
        return wrapper;
    },
    
    // Check if text contains math
    containsMath(text) {
        if (!text) return false;
        
        // Check for common math delimiters
        const mathPatterns = [
            /\$[^$]+\$/,          // Inline math: $...$
            /\\\(.+\\\)/,          // Inline math: \(...\)
            /\$\$[^$]+\$\$/,      // Display math: $$...$$
            /\\\[.+\\\]/,         // Display math: \[...\]
            /\\begin\{.+?\}/,     // LaTeX environments
            /\\(frac|sqrt|sum|int|lim)/, // Common commands
        ];
        
        return mathPatterns.some(pattern => pattern.test(text));
    },
    
    // Auto-render math in element
    autoRender(element) {
        if (!element) return;
        
        // Find text nodes that contain math
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        const nodesToProcess = [];
        
        while ((node = walker.nextNode())) {
            if (this.containsMath(node.textContent)) {
                nodesToProcess.push(node);
            }
        }
        
        // Process nodes
        nodesToProcess.forEach(textNode => {
            const span = document.createElement('span');
            span.className = 'math-content';
            span.textContent = textNode.textContent;
            textNode.parentNode.replaceChild(span, textNode);
        });
        
        // Render math in the element
        if (nodesToProcess.length > 0) {
            this.render(element);
        }
    },
    
    // Clean up
    cleanup() {
        this.queue = [];
        
        if (typeof MathJax !== 'undefined') {
            try {
                MathJax.texReset();
                MathJax.typesetClear();
            } catch (error) {
                console.warn('MathJax cleanup error:', error);
            }
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    MathJaxLoader.init();
    
    // Auto-render math in the whole document after load
    setTimeout(() => {
        MathJaxLoader.autoRender(document.body);
    }, 500);
});

// Export to window
window.MathJaxLoader = MathJaxLoader;