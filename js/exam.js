// ==================== EXAM SYSTEM ====================

let currentExam = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let examTimer = null;
let timeRemaining = 0;

// Start Exam
function startExam(examData) {
    if(!examData) return;
    
    currentExam = examData;
    currentQuestionIndex = 0;
    userAnswers = new Array(examData.questions.length).fill(null);
    timeRemaining = examData.duration * 60; // Convert to seconds
    
    // Show exam view
    showView('exam', { exam: examData });
    
    // Start timer
    startTimer();
    
    // Load first question
    loadQuestion();
}

// Load Question
function loadQuestion() {
    if(!currentExam) return;
    
    const question = currentExam.questions[currentQuestionIndex];
    const examView = document.getElementById('exam-view');
    
    if(!examView) return;
    
    examView.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <span class="badge badge-primary">Question ${currentQuestionIndex + 1}/${currentExam.questions.length}</span>
                <span class="badge">Marks: +${currentExam.marking?.correct || 1}</span>
            </div>
            
            <div class="question-text">
                ${question.text || question.q}
            </div>
            
            ${question.image ? `<img src="${question.image}" class="question-image">` : ''}
            
            <div class="options">
                ${question.options.map((option, index) => `
                    <div class="option ${userAnswers[currentQuestionIndex] === option ? 'selected' : ''}"
                         onclick="selectOption(${index})">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </div>
                `).join('')}
            </div>
            
            <div class="question-footer">
                <button class="btn btn-outline" onclick="prevQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                    Previous
                </button>
                <button class="btn btn-outline" onclick="markForReview()">
                    Mark for Review
                </button>
                <button class="btn btn-primary" onclick="nextQuestion()">
                    ${currentQuestionIndex === currentExam.questions.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    `;
}

// Select Option
function selectOption(optionIndex) {
    if(!currentExam) return;
    
    const question = currentExam.questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = question.options[optionIndex];
    loadQuestion();
}

// Next Question
function nextQuestion() {
    if(!currentExam) return;
    
    if(currentQuestionIndex < currentExam.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        finishExam();
    }
}

// Previous Question
function prevQuestion() {
    if(currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Mark for Review
function markForReview() {
    // Implementation for review marking
    showNotification('Question marked for review', 'info');
}

// Start Timer
function startTimer() {
    if(examTimer) clearInterval(examTimer);
    
    examTimer = setInterval(() => {
        timeRemaining--;
        
        // Update timer display
        const timerElement = document.getElementById('exam-timer');
        if(timerElement) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Time's up
        if(timeRemaining <= 0) {
            clearInterval(examTimer);
            finishExam();
        }
    }, 1000);
}

// Finish Exam
function finishExam() {
    clearInterval(examTimer);
    
    // Calculate score
    const score = calculateScore();
    
    // Show result
    showView('result', { score });
    
    // Save result
    saveResult(score);
}

// Calculate Score
function calculateScore() {
    if(!currentExam) return { total: 0, correct: 0, wrong: 0 };
    
    let correct = 0;
    let wrong = 0;
    const correctMark = currentExam.marking?.correct || 1;
    const wrongMark = currentExam.marking?.wrong || 0.25;
    
    currentExam.questions.forEach((question, index) => {
        if(userAnswers[index] === question.answer) {
            correct++;
        } else if(userAnswers[index] !== null) {
            wrong++;
        }
    });
    
    const totalScore = (correct * correctMark) - (wrong * wrongMark);
    
    return {
        total: Math.max(0, totalScore),
        correct,
        wrong,
        skipped: userAnswers.filter(a => a === null).length,
        percentage: ((correct / currentExam.questions.length) * 100).toFixed(1)
    };
}

// Save Result
async function saveResult(score) {
    const result = {
        examId: currentExam.id,
        examName: currentExam.title,
        score: score.total,
        correct: score.correct,
        wrong: score.wrong,
        percentage: score.percentage,
        timestamp: new Date().toISOString(),
        duration: (currentExam.duration * 60) - timeRemaining
    };
    
    // Save to localStorage
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    results.push(result);
    localStorage.setItem('examResults', JSON.stringify(results));
    
    // TODO: Save to Firebase
}

// Render Exam View
function renderExamView(params) {
    return `
        <div class="exam-container">
            <div class="exam-header">
                <div class="timer" id="exam-timer">
                    00:00
                </div>
                <div>
                    ${currentExam?.title || 'Exam'}
                </div>
                <button class="btn btn-sm" onclick="showView('dashboard')">
                    Exit
                </button>
            </div>
            
            <div id="exam-view">
                <!-- Questions will be loaded here -->
            </div>
        </div>
    `;
}

// Render Result View
function renderResultView(params) {
    const score = params.score || { total: 0, correct: 0, wrong: 0, percentage: 0 };
    
    return `
        <div class="container">
            <div class="header">
                <h2>📊 Exam Result</h2>
                <p>${currentExam?.title || 'Exam Completed'}</p>
            </div>
            
            <div class="p-20">
                <!-- Score Card -->
                <div class="card text-center">
                    <h3 style="color:var(--primary);">Your Score</h3>
                    <div class="stat-value" style="font-size:3rem;">
                        ${score.total.toFixed(2)}
                    </div>
                    <div class="stat-label">
                        ${score.percentage}% Correct
                    </div>
                </div>
                
                <!-- Stats -->
                <div class="stats-grid mt-20">
                    <div class="stat-card">
                        <div class="stat-value" style="color:var(--secondary);">
                            ${score.correct}
                        </div>
                        <div class="stat-label">Correct</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color:var(--danger);">
                            ${score.wrong}
                        </div>
                        <div class="stat-label">Wrong</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">
                            ${score.skipped || 0}
                        </div>
                        <div class="stat-label">Skipped</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">
                            ${currentExam?.questions.length || 0}
                        </div>
                        <div class="stat-label">Total</div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="mt-20">
                    <button class="btn btn-primary" onclick="reviewAnswers()">
                        Review Answers
                    </button>
                    <button class="btn btn-outline mt-10" onclick="showView('dashboard')">
                        Back to Home
                    </button>
                    <button class="btn btn-success mt-10" onclick="shareResult()">
                        Share Result
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Review Answers
function reviewAnswers() {
    // Implementation for answer review
    showNotification('Review feature coming soon', 'info');
}

// Share Result
function shareResult() {
    if(navigator.share) {
        navigator.share({
            title: `My Score: ${currentExam?.title}`,
            text: `I scored ${calculateScore().total} in ${currentExam?.title}!`,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(`Score: ${calculateScore().total} in ${currentExam?.title}`);
        showNotification('Result copied to clipboard!', 'success');
    }
}

// Export functions
window.startExam = startExam;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.markForReview = markForReview;
window.reviewAnswers = reviewAnswers;
window.shareResult = shareResult;