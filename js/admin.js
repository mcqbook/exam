// ==================== ADMIN PANEL FUNCTIONS ====================

// Admin State
let adminExams = [];
let adminResults = [];
let adminCategories = [];

// Initialize Admin Panel
function initAdminPanel() {
    loadAdminData();
    updateAdminStats();
}

// Load Admin Data
async function loadAdminData() {
    try {
        // Load exams
        adminExams = JSON.parse(localStorage.getItem('adminExams') || '[]');
        
        // Load results
        adminResults = JSON.parse(localStorage.getItem('examResults') || '[]');
        
        // Load categories
        adminCategories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        console.log('Admin data loaded');
    } catch(error) {
        console.error('Error loading admin data:', error);
    }
}

// Update Admin Statistics
function updateAdminStats() {
    document.getElementById('total-exams').textContent = adminExams.length;
    document.getElementById('total-results').textContent = adminResults.length;
    
    // Calculate average score
    const avgScore = adminResults.length > 0 
        ? (adminResults.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / adminResults.length).toFixed(1)
        : '0';
    document.getElementById('avg-score').textContent = `${avgScore}%`;
}

// Create New Exam
function createNewExam() {
    showView('exam-editor');
}

// Exam Editor View
function renderExamEditor(examData = null) {
    const isEdit = examData !== null;
    
    return `
        <div class="container">
            <div class="header">
                <h2>${isEdit ? '✏️ Edit Exam' : '📝 Create New Exam'}</h2>
                <p>${isEdit ? 'Update exam details' : 'Create a new mock test'}</p>
            </div>
            
            <div class="p-20">
                <div class="exam-form">
                    <!-- Basic Info -->
                    <div class="form-group">
                        <label class="form-label">Exam Title</label>
                        <input type="text" id="exam-title" class="form-control" 
                               value="${examData?.title || ''}" placeholder="Enter exam title">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select id="exam-category" class="form-control">
                            <option value="">Select Category</option>
                            ${adminCategories.map(cat => `
                                <option value="${cat.id}" ${examData?.category === cat.id ? 'selected' : ''}>
                                    ${cat.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label class="form-label">Duration (minutes)</label>
                            <input type="number" id="exam-duration" class="form-control" 
                                   value="${examData?.duration || 30}" min="1">
                        </div>
                        <div>
                            <label class="form-label">Total Questions</label>
                            <input type="number" id="exam-total-questions" class="form-control" 
                                   value="${examData?.questions?.length || 10}" min="1">
                        </div>
                    </div>
                    
                    <!-- Marking Scheme -->
                    <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label class="form-label">Positive Mark</label>
                            <input type="number" step="0.25" id="exam-positive-mark" class="form-control" 
                                   value="${examData?.marking?.correct || 1}">
                        </div>
                        <div>
                            <label class="form-label">Negative Mark</label>
                            <input type="number" step="0.25" id="exam-negative-mark" class="form-control" 
                                   value="${examData?.marking?.wrong || 0.25}">
                        </div>
                    </div>
                    
                    <!-- Questions Editor -->
                    <div class="form-group">
                        <label class="form-label">Questions</label>
                        <div id="questions-container">
                            ${renderQuestionsEditor(examData?.questions || [])}
                        </div>
                        <button class="btn btn-outline mt-10" onclick="addQuestionField()">
                            + Add Question
                        </button>
                    </div>
                    
                    <!-- Actions -->
                    <div class="form-group" style="display:flex; gap:10px; margin-top:30px;">
                        <button class="btn btn-primary" onclick="saveExam()">
                            ${isEdit ? 'Update Exam' : 'Create Exam'}
                        </button>
                        <button class="btn btn-outline" onclick="showView('admin')">
                            Cancel
                        </button>
                        ${isEdit ? `
                            <button class="btn btn-danger" onclick="deleteExam('${examData?.id}')">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Questions Editor
function renderQuestionsEditor(questions) {
    if(questions.length === 0) {
        return `
            <div class="alert alert-info">
                No questions added yet. Click "Add Question" to start.
            </div>
        `;
    }
    
    return questions.map((q, index) => `
        <div class="question-editor" data-index="${index}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <strong>Question ${index + 1}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeQuestion(${index})">
                    Remove
                </button>
            </div>
            
            <div class="form-group">
                <textarea class="form-control" placeholder="Question text" 
                          style="height:80px;">${q.text || q.q}</textarea>
            </div>
            
            <div class="form-group">
                <label>Options</label>
                ${(q.options || ['', '', '', '']).map((opt, optIndex) => `
                    <div class="option-row">
                        <input type="radio" name="correct-${index}" value="${optIndex}" 
                               ${q.answer === opt ? 'checked' : ''}>
                        <input type="text" class="option-input" value="${opt}" 
                               placeholder="Option ${String.fromCharCode(65 + optIndex)}">
                    </div>
                `).join('')}
            </div>
            
            <div class="form-group">
                <input type="text" class="form-control" value="${q.explanation || ''}" 
                       placeholder="Explanation (optional)">
            </div>
            
            <hr style="margin:20px 0;">
        </div>
    `).join('');
}

// Add Question Field
function addQuestionField() {
    const container = document.getElementById('questions-container');
    const index = container.children.length;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-editor';
    questionDiv.setAttribute('data-index', index);
    questionDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <strong>Question ${index + 1}</strong>
            <button class="btn btn-sm btn-danger" onclick="removeQuestion(${index})">
                Remove
            </button>
        </div>
        
        <div class="form-group">
            <textarea class="form-control" placeholder="Question text" style="height:80px;"></textarea>
        </div>
        
        <div class="form-group">
            <label>Options</label>
            ${['A', 'B', 'C', 'D'].map((letter, optIndex) => `
                <div class="option-row">
                    <input type="radio" name="correct-${index}" value="${optIndex}">
                    <input type="text" class="option-input" placeholder="Option ${letter}">
                </div>
            `).join('')}
        </div>
        
        <div class="form-group">
            <input type="text" class="form-control" placeholder="Explanation (optional)">
        </div>
        
        <hr style="margin:20px 0;">
    `;
    
    container.appendChild(questionDiv);
}

// Remove Question
function removeQuestion(index) {
    const container = document.getElementById('questions-container');
    const questionDiv = container.querySelector(`[data-index="${index}"]`);
    if(questionDiv) {
        questionDiv.remove();
        
        // Update indices
        const questions = container.querySelectorAll('.question-editor');
        questions.forEach((div, newIndex) => {
            div.setAttribute('data-index', newIndex);
            div.querySelector('strong').textContent = `Question ${newIndex + 1}`;
        });
    }
}

// Save Exam
function saveExam() {
    // Collect exam data
    const examData = {
        id: Date.now().toString(),
        title: document.getElementById('exam-title').value,
        category: document.getElementById('exam-category').value,
        duration: parseInt(document.getElementById('exam-duration').value),
        totalQuestions: parseInt(document.getElementById('exam-total-questions').value),
        marking: {
            correct: parseFloat(document.getElementById('exam-positive-mark').value),
            wrong: parseFloat(document.getElementById('exam-negative-mark').value)
        },
        createdAt: new Date().toISOString(),
        questions: collectQuestionsData()
    };
    
    // Save to localStorage
    adminExams.push(examData);
    localStorage.setItem('adminExams', JSON.stringify(adminExams));
    
    // Show success message
    showNotification('Exam saved successfully!', 'success');
    
    // Return to admin panel
    setTimeout(() => showView('admin'), 1500);
}

// Collect Questions Data
function collectQuestionsData() {
    const questions = [];
    const containers = document.querySelectorAll('.question-editor');
    
    containers.forEach(container => {
        const textarea = container.querySelector('textarea');
        const options = container.querySelectorAll('.option-input');
        const explanation = container.querySelector('input[type="text"]');
        
        // Find correct answer
        let correctAnswer = '';
        const radios = container.querySelectorAll('input[type="radio"]');
        radios.forEach((radio, index) => {
            if(radio.checked) {
                correctAnswer = options[index].value;
            }
        });
        
        questions.push({
            text: textarea.value,
            options: Array.from(options).map(opt => opt.value),
            answer: correctAnswer,
            explanation: explanation?.value || ''
        });
    });
    
    return questions;
}

// Manage Categories
function manageCategories() {
    showView('categories');
}

// Render Categories View
function renderCategoriesView() {
    return `
        <div class="container">
            <div class="header">
                <h2>🗂️ Manage Categories</h2>
                <p>Add, edit or delete categories</p>
            </div>
            
            <div class="p-20">
                <!-- Add Category Form -->
                <div class="card mb-20">
                    <h3 class="card-title">Add New Category</h3>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="new-category-name" class="form-control" 
                               placeholder="Category name">
                        <button class="btn btn-primary" onclick="addCategory()">
                            Add
                        </button>
                    </div>
                </div>
                
                <!-- Categories List -->
                <div class="card">
                    <h3 class="card-title">Existing Categories</h3>
                    <div id="categories-list">
                        ${renderCategoriesList()}
                    </div>
                </div>
                
                <button class="btn btn-outline mt-20" onclick="showView('admin')">
                    Back to Dashboard
                </button>
            </div>
        </div>
    `;
}

// Render Categories List
function renderCategoriesList() {
    if(adminCategories.length === 0) {
        return '<p class="text-center">No categories found.</p>';
    }
    
    return adminCategories.map(cat => `
        <div class="setting-item">
            <div class="setting-label">${cat.name}</div>
            <div>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat.id}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Add Category
function addCategory() {
    const nameInput = document.getElementById('new-category-name');
    const name = nameInput.value.trim();
    
    if(!name) {
        showNotification('Please enter category name', 'error');
        return;
    }
    
    const newCategory = {
        id: Date.now().toString(),
        name: name,
        createdAt: new Date().toISOString()
    };
    
    adminCategories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(adminCategories));
    
    // Clear input
    nameInput.value = '';
    
    // Update view
    document.getElementById('categories-list').innerHTML = renderCategoriesList();
    showNotification('Category added successfully', 'success');
}

// Delete Category
function deleteCategory(categoryId) {
    if(confirm('Are you sure you want to delete this category?')) {
        adminCategories = adminCategories.filter(cat => cat.id !== categoryId);
        localStorage.setItem('categories', JSON.stringify(adminCategories));
        
        // Update view
        document.getElementById('categories-list').innerHTML = renderCategoriesList();
        showNotification('Category deleted', 'success');
    }
}

// View Results
function viewResults() {
    showView('results');
}

// Render Results View
function renderResultsView() {
    return `
        <div class="container">
            <div class="header">
                <h2>📊 Exam Results</h2>
                <p>View all exam results</p>
            </div>
            
            <div class="p-20">
                <!-- Filters -->
                <div class="card mb-20">
                    <h3 class="card-title">Filters</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <select class="form-control" id="filter-exam">
                            <option value="">All Exams</option>
                            ${adminExams.map(exam => `
                                <option value="${exam.id}">${exam.title}</option>
                            `).join('')}
                        </select>
                        <select class="form-control" id="filter-date">
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
                
                <!-- Results Table -->
                <div class="card">
                    <h3 class="card-title">Results (${adminResults.length})</h3>
                    <div class="results-table">
                        <div class="table-header" style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
                            <div>Exam</div>
                            <div>Score</div>
                            <div>%</div>
                            <div>Correct</div>
                            <div>Date</div>
                        </div>
                        
                        <div class="table-body">
                            ${renderResultsTable()}
                        </div>
                    </div>
                </div>
                
                <!-- Export Buttons -->
                <div class="export-buttons mt-20">
                    <button class="export-btn export-pdf" onclick="exportResults('pdf')">
                        📄 Export as PDF
                    </button>
                    <button class="export-btn export-excel" onclick="exportResults('excel')">
                        📊 Export as Excel
                    </button>
                    <button class="export-btn export-json" onclick="exportResults('json')">
                        📦 Export as JSON
                    </button>
                </div>
                
                <button class="btn btn-outline mt-20" onclick="showView('admin')">
                    Back to Dashboard
                </button>
            </div>
        </div>
    `;
}

// Render Results Table
function renderResultsTable() {
    if(adminResults.length === 0) {
        return '<div class="text-center p-20">No results found.</div>';
    }
    
    return adminResults.map(result => `
        <div class="table-row" style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
            <div>${result.examName || 'Unknown Exam'}</div>
            <div><strong>${result.score || 0}</strong></div>
            <div>${result.percentage || 0}%</div>
            <div>${result.correct || 0}</div>
            <div>${new Date(result.timestamp).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// Export Results
function exportResults(format) {
    let data = '';
    let filename = '';
    
    switch(format) {
        case 'json':
            data = JSON.stringify(adminResults, null, 2);
            filename = 'results.json';
            break;
        case 'csv':
            // Convert to CSV
            const headers = ['Exam Name', 'Score', 'Percentage', 'Correct', 'Wrong', 'Date'];
            const rows = adminResults.map(r => [
                r.examName,
                r.score,
                r.percentage,
                r.correct,
                r.wrong,
                new Date(r.timestamp).toLocaleDateString()
            ]);
            data = [headers, ...rows].map(row => row.join(',')).join('\n');
            filename = 'results.csv';
            break;
        case 'pdf':
            showNotification('PDF export coming soon', 'info');
            return;
    }
    
    // Download file
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    showNotification(`Exported as ${format.toUpperCase()}`, 'success');
}

// Show Settings
function showSettings() {
    showView('settings');
}

// Render Settings View
function renderSettingsView() {
    return `
        <div class="container">
            <div class="header">
                <h2>⚙️ System Settings</h2>
                <p>Configure your application</p>
     