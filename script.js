/**
 * ============================================
 * MATH NOVA QUIZ APP - JAVASCRIPT
 * Unique prefix: mathNova_ / mqz_
 * Version: 1.0
 * 
 * Features:
 * - Dynamic JSON fetching
 * - Multiple quiz category support
 * - Responsive design
 * - Smooth animations
 * - Score tracking
 * - Restart functionality
 * ============================================
 */

// ============================================
// GLOBAL STATE VARIABLES
// All prefixed with mathNova_ to avoid conflicts
// ============================================
let mathNova_questions = [];        // Array to store fetched questions
let mathNova_currentIndex = 0;    // Current question index
let mathNova_userScore = 0;       // Current score
let mathNova_hasAnswered = false; // Flag to prevent multiple answers
let mathNova_isFetching = false;  // Flag to prevent duplicate fetches

// ============================================
// DOM ELEMENT REFERENCES
// Cached for performance, all prefixed with mathNova_
// ============================================
const mathNova_elements = {
  // Screens
  loadingScreen: document.getElementById('mathNova_loadingScreen'),
  startScreen: document.getElementById('mathNova_startScreen'),
  quizScreen: document.getElementById('mathNova_quizScreen'),
  resultScreen: document.getElementById('mathNova_resultScreen'),
  errorScreen: document.getElementById('mathNova_errorScreen'),
  
  // Start screen elements
  quizTitle: document.getElementById('mathNova_quizTitle'),
  startBtn: document.getElementById('mathNova_startBtn'),
  
  // Quiz screen elements
  questionCounter: document.getElementById('mathNova_questionCounter'),
  scoreDisplay: document.getElementById('mathNova_scoreDisplay'),
  progressBar: document.getElementById('mathNova_progressBar'),
  categoryBadge: document.getElementById('mathNova_categoryBadge'),
  questionText: document.getElementById('mathNova_questionText'),
  optionsGrid: document.getElementById('mathNova_optionsGrid'),
  feedbackArea: document.getElementById('mathNova_feedbackArea'),
  feedbackIcon: document.getElementById('mathNova_feedbackIcon'),
  feedbackText: document.getElementById('mathNova_feedbackText'),
  nextBtn: document.getElementById('mathNova_nextBtn'),
  
  // Result screen elements
  finalScore: document.getElementById('mathNova_finalScore'),
  resultMessage: document.getElementById('mathNova_resultMessage'),
  correctCount: document.getElementById('mathNova_correctCount'),
  wrongCount: document.getElementById('mathNova_wrongCount'),
  percentScore: document.getElementById('mathNova_percentScore'),
  restartBtn: document.getElementById('mathNova_restartBtn'),
  
  // Error screen elements
  errorMessage: document.getElementById('mathNova_errorMessage'),
  retryBtn: document.getElementById('mathNova_retryBtn')
};

// ============================================
// SCREEN MANAGEMENT
// Functions to switch between app screens
// ============================================

/**
 * Shows a specific screen and hides all others
 * @param {string} screenName - Name of screen to show
 */
function mathNova_showScreen(screenName) {
  // Hide all screens first
  mathNova_elements.loadingScreen.classList.add('mathNova_hidden');
  mathNova_elements.startScreen.classList.add('mathNova_hidden');
  mathNova_elements.quizScreen.classList.add('mathNova_hidden');
  mathNova_elements.resultScreen.classList.add('mathNova_hidden');
  mathNova_elements.errorScreen.classList.add('mathNova_hidden');
  
  // Show requested screen
  switch(screenName) {
    case 'loading':
      mathNova_elements.loadingScreen.classList.remove('mathNova_hidden');
      break;
    case 'start':
      mathNova_elements.startScreen.classList.remove('mathNova_hidden');
      mathNova_elements.startScreen.classList.add('mathNova_fadeIn');
      break;
    case 'quiz':
      mathNova_elements.quizScreen.classList.remove('mathNova_hidden');
      mathNova_elements.quizScreen.classList.add('mathNova_fadeIn');
      break;
    case 'result':
      mathNova_elements.resultScreen.classList.remove('mathNova_hidden');
      mathNova_elements.resultScreen.classList.add('mathNova_fadeIn');
      break;
    case 'error':
      mathNova_elements.errorScreen.classList.remove('mathNova_hidden');
      mathNova_elements.errorScreen.classList.add('mathNova_fadeIn');
      break;
  }
}

// ============================================
// DATA FETCHING
// Fetches quiz questions from external JSON
// ============================================

/**
 * Fetches quiz data from the configured JSON URL
 * Uses the global mathNova_jsonUrl and mathNova_quizCategory variables
 */
async function mathNova_fetchQuizData() {
  // Prevent duplicate fetches
  if (mathNova_isFetching) return;
  mathNova_isFetching = true;
  
  mathNova_showScreen('loading');
  
  try {
    // Check if config variables exist
    if (typeof mathNova_jsonUrl === 'undefined' || !mathNova_jsonUrl) {
      throw new Error('Quiz JSON URL not configured. Please set mathNova_jsonUrl variable.');
    }
    
    if (typeof mathNova_quizCategory === 'undefined' || !mathNova_quizCategory) {
      throw new Error('Quiz category not configured. Please set mathNova_quizCategory variable.');
    }
    
    // Fetch the JSON data
    const mqz_response = await fetch(mathNova_jsonUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Add cache control for fresh data
      cache: 'no-cache'
    });
    
    // Check if response is OK
    if (!mqz_response.ok) {
      throw new Error(`HTTP error! Status: ${mqz_response.status}`);
    }
    
    // Parse JSON
    const mqz_data = await mqz_response.json();
    
    // Extract questions using the category key
    // This allows multiple quiz sets in one JSON file
    if (!mqz_data[mathNova_quizCategory]) {
      throw new Error(`Quiz category "${mathNova_quizCategory}" not found in JSON data.`);
    }
    
    mathNova_questions = mqz_data[mathNova_quizCategory];
    
    // Validate questions array
    if (!Array.isArray(mathNova_questions) || mathNova_questions.length === 0) {
      throw new Error('No questions found in the selected quiz category.');
    }
    
    // Shuffle questions for random order (optional)
    // Remove or comment out the next line if you want fixed order
    mathNova_shuffleArray(mathNova_questions);
    
    // Update title if custom title is set
    if (typeof mathNova_customTitle !== 'undefined' && mathNova_customTitle) {
      mathNova_elements.quizTitle.textContent = mathNova_customTitle;
    }
    
    // Show start screen after successful load
    mathNova_showScreen('start');
    
  } catch (mqz_error) {
    console.error('Math Nova Quiz Error:', mqz_error);
    mathNova_elements.errorMessage.textContent = mqz_error.message || 'Failed to load quiz data. Please check your internet connection and try again.';
    mathNova_showScreen('error');
  } finally {
    mathNova_isFetching = false;
  }
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} mqz_array - Array to shuffle
 */
function mathNova_shuffleArray(mqz_array) {
  for (let mqz_i = mqz_array.length - 1; mqz_i > 0; mqz_i--) {
    const mqz_j = Math.floor(Math.random() * (mqz_i + 1));
    [mqz_array[mqz_i], mqz_array[mqz_j]] = [mqz_array[mqz_j], mqz_array[mqz_i]];
  }
}

// ============================================
// QUIZ LOGIC
// Core quiz functionality
// ============================================

/**
 * Starts the quiz - resets state and shows first question
 */
function mathNova_startQuiz() {
  // Reset all quiz state variables
  mathNova_currentIndex = 0;
  mathNova_userScore = 0;
  mathNova_hasAnswered = false;
  
  // Update score display
  mathNova_elements.scoreDisplay.textContent = 'Score: 0';
  
  // Show quiz screen
  mathNova_showScreen('quiz');
  
  // Load first question
  mathNova_loadQuestion();
}

/**
 * Loads the current question into the UI
 */
function mathNova_loadQuestion() {
  const mqz_currentQuestion = mathNova_questions[mathNova_currentIndex];
  
  // Reset answer state
  mathNova_hasAnswered = false;
  
  // Update progress
  const mqz_progress = ((mathNova_currentIndex + 1) / mathNova_questions.length) * 100;
  mathNova_elements.progressBar.style.width = mqz_progress + '%';
  mathNova_elements.questionCounter.textContent = `Question ${mathNova_currentIndex + 1} of ${mathNova_questions.length}`;
  
  // Update category badge
  mathNova_elements.categoryBadge.textContent = mqz_currentQuestion.mqz_category || 'Math';
  
  // Update question text with animation
  mathNova_elements.questionText.style.opacity = '0';
  setTimeout(() => {
    mathNova_elements.questionText.textContent = mqz_currentQuestion.mqz_question;
    mathNova_elements.questionText.style.opacity = '1';
  }, 150);
  
  // Clear and rebuild options
  mathNova_elements.optionsGrid.innerHTML = '';
  
  // Create option buttons
  const mqz_options = ['A', 'B', 'C', 'D'];
  mqz_options.forEach((mqz_letter) => {
    const mqz_optionKey = `mqz_option${mqz_letter}`;
    const mqz_optionText = mqz_currentQuestion[mqz_optionKey];
    
    if (mqz_optionText) {
      const mqz_btn = document.createElement('button');
      mqz_btn.className = 'mathNova_optionBtn';
      mqz_btn.setAttribute('data-option', mqz_letter);
      mqz_btn.setAttribute('data-value', mqz_letter);
      mqz_btn.innerHTML = `<span class="mathNova_optionText">${mathNova_escapeHtml(mqz_optionText)}</span>`;
      mqz_btn.setAttribute('aria-label', `Option ${mqz_letter}: ${mqz_optionText}`);
      
      // Add click handler
      mqz_btn.addEventListener('click', () => mathNova_handleAnswer(mqz_letter, mqz_btn));
      
      mathNova_elements.optionsGrid.appendChild(mqz_btn);
    }
  });
  
  // Hide feedback and next button
  mathNova_elements.feedbackArea.classList.add('mathNova_hidden');
  mathNova_elements.nextBtn.classList.add('mathNova_hidden');
  
  // Animate card entrance
  const mqz_card = document.getElementById('mathNova_questionCard');
  mqz_card.classList.remove('mathNova_slideUp');
  void mqz_card.offsetWidth; // Trigger reflow
  mqz_card.classList.add('mathNova_slideUp');
}

/**
 * Handles user's answer selection
 * @param {string} mqz_selectedOption - Letter of selected option (A, B, C, D)
 * @param {HTMLElement} mqz_btnElement - The button element clicked
 */
function mathNova_handleAnswer(mqz_selectedOption, mqz_btnElement) {
  // Prevent answering if already answered
  if (mathNova_hasAnswered) return;
  mathNova_hasAnswered = true;
  
  const mqz_currentQuestion = mathNova_questions[mathNova_currentIndex];
  const mqz_correctAnswer = mqz_currentQuestion.mqz_correctAnswer;
  const mqz_isCorrect = mqz_selectedOption === mqz_correctAnswer;
  
  // Disable all option buttons
  const mqz_allButtons = mathNova_elements.optionsGrid.querySelectorAll('.mathNova_optionBtn');
  mqz_allButtons.forEach(mqz_btn => {
    mqz_btn.disabled = true;
    
    const mqz_btnValue = mqz_btn.getAttribute('data-value');
    
    // Highlight correct answer
    if (mqz_btnValue === mqz_correctAnswer) {
      mqz_btn.classList.add('mathNova_optionCorrect');
    }
    
    // Highlight wrong answer if selected
    if (mqz_btnValue === mqz_selectedOption && !mqz_isCorrect) {
      mqz_btn.classList.add('mathNova_optionWrong');
      mqz_btn.classList.add('mathNova_shake');
    }
    
    // Mark selected option
    if (mqz_btnValue === mqz_selectedOption) {
      mqz_btn.classList.add('mathNova_optionSelected');
    }
  });
  
  // Update score if correct
  if (mqz_isCorrect) {
    mathNova_userScore++;
    mathNova_elements.scoreDisplay.textContent = `Score: ${mathNova_userScore}`;
  }
  
  // Show feedback
  mathNova_showFeedback(mqz_isCorrect, mqz_correctAnswer);
  
  // Show next button or finish button
  mathNova_elements.nextBtn.classList.remove('mathNova_hidden');
  
  // Change button text if last question
  if (mathNova_currentIndex === mathNova_questions.length - 1) {
    mathNova_elements.nextBtn.innerHTML = '<span>See Results</span><span class="mathNova_btnArrow">→</span>';
  } else {
    mathNova_elements.nextBtn.innerHTML = '<span>Next Question</span><span class="mathNova_btnArrow">→</span>';
  }
}

/**
 * Shows feedback after answering
 * @param {boolean} mqz_isCorrect - Whether answer was correct
 * @param {string} mqz_correctAnswer - The correct answer letter
 */
function mathNova_showFeedback(mqz_isCorrect, mqz_correctAnswer) {
  mathNova_elements.feedbackArea.classList.remove('mathNova_hidden');
  mathNova_elements.feedbackArea.className = 'mathNova_feedbackArea';
  
  if (mqz_isCorrect) {
    mathNova_elements.feedbackArea.classList.add('mathNova_feedbackCorrect');
    mathNova_elements.feedbackIcon.textContent = '✅';
    mathNova_elements.feedbackText.textContent = 'Correct! Well done! 🎉';
  } else {
    mathNova_elements.feedbackArea.classList.add('mathNova_feedbackWrong');
    mathNova_elements.feedbackIcon.textContent = '❌';
    mathNova_elements.feedbackText.textContent = `Incorrect. The correct answer was ${mqz_correctAnswer}.`;
  }
}

/**
 * Handles next button click
 * Advances to next question or shows results
 */
function mathNova_handleNext() {
  mathNova_currentIndex++;
  
  if (mathNova_currentIndex < mathNova_questions.length) {
    // Load next question
    mathNova_loadQuestion();
  } else {
    // Show results
    mathNova_showResults();
  }
}

// ============================================
// RESULTS SCREEN
// Displays final score and statistics
// ============================================

/**
 * Calculates and displays final results
 */
function mathNova_showResults() {
  mathNova_showScreen('result');
  
  const mqz_total = mathNova_questions.length;
  const mqz_correct = mathNova_userScore;
  const mqz_wrong = mqz_total - mqz_correct;
  const mqz_percentage = Math.round((mqz_correct / mqz_total) * 100);
  
  // Animate score counter
  mathNova_animateNumber(mathNova_elements.finalScore, 0, mqz_correct, 1000);
  
  // Update breakdown
  mathNova_elements.correctCount.textContent = mqz_correct;
  mathNova_elements.wrongCount.textContent = mqz_wrong;
  mathNova_elements.percentScore.textContent = mqz_percentage + '%';
  
  // Set result message based on score
  let mqz_message = '';
  if (mqz_percentage >= 90) {
    mqz_message = '🌟 Outstanding! You are a Math Master!';
  } else if (mqz_percentage >= 75) {
    mqz_message = '🎉 Great job! You have strong math skills!';
  } else if (mqz_percentage >= 50) {
    mqz_message = '👍 Good effort! Keep practicing to improve!';
  } else {
    mqz_message = '💪 Keep practicing! You will get better!';
  }
  mathNova_elements.resultMessage.textContent = mqz_message;
}

/**
 * Animates a number from start to end value
 * @param {HTMLElement} mqz_element - Element to update
 * @param {number} mqz_start - Starting number
 * @param {number} mqz_end - Ending number
 * @param {number} mqz_duration - Animation duration in ms
 */
function mathNova_animateNumber(mqz_element, mqz_start, mqz_end, mqz_duration) {
  const mqz_startTime = performance.now();
  
  function mqz_update(mqz_currentTime) {
    const mqz_elapsed = mqz_currentTime - mqz_startTime;
    const mqz_progress = Math.min(mqz_elapsed / mqz_duration, 1);
    
    // Easing function for smooth animation
    const mqz_eased = 1 - Math.pow(1 - mqz_progress, 3);
    const mqz_current = Math.round(mqz_start + (mqz_end - mqz_start) * mqz_eased);
    
    mqz_element.textContent = mqz_current;
    
    if (mqz_progress < 1) {
      requestAnimationFrame(mqz_update);
    }
  }
  
  requestAnimationFrame(mqz_update);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} mqz_text - Text to escape
 * @returns {string} Escaped HTML string
 */
function mathNova_escapeHtml(mqz_text) {
  const mqz_div = document.createElement('div');
  mqz_div.textContent = mqz_text;
  return mqz_div.innerHTML;
}

// ============================================
// EVENT LISTENERS
// All attached when DOM is ready
// ============================================

/**
 * Initializes the quiz app
 * Called when DOM is fully loaded
 */
function mathNova_init() {
  // Attach event listeners to buttons
  if (mathNova_elements.startBtn) {
    mathNova_elements.startBtn.addEventListener('click', mathNova_startQuiz);
  }
  
  if (mathNova_elements.nextBtn) {
    mathNova_elements.nextBtn.addEventListener('click', mathNova_handleNext);
  }
  
  if (mathNova_elements.restartBtn) {
    mathNova_elements.restartBtn.addEventListener('click', mathNova_startQuiz);
  }
  
  if (mathNova_elements.retryBtn) {
    mathNova_elements.retryBtn.addEventListener('click', mathNova_fetchQuizData);
  }
  
  // Fetch quiz data on initialization
  mathNova_fetchQuizData();
}

// ============================================
// INITIALIZATION
// Wait for DOM to be ready before starting
// ============================================

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mathNova_init);
} else {
  // DOM already loaded, initialize immediately
  mathNova_init();
}