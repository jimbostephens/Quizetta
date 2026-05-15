// The URL of your Netlify Function
const FUNCTION_URL = '/.netlify/functions/getQuestion';

// State management
let questionHistory = [];
let currentQuestionIndex = -1;

// DOM element references
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');
const questionImageEl = document.getElementById('question-image');

/**
 * Persistence Logic: 
 * Tracks the rowids of the last 100 questions in the browser.
 */
function getRecentIds() {
    const seen = localStorage.getItem('seenQuestions');
    return seen ? JSON.parse(seen) : [];
}

function saveIdToHistory(id) {
    if (!id) return;
    let seen = getRecentIds();
    
    // Add new ID if it's not already the most recent
    seen.push(id);
    
    // Maintain the sliding window of 100
    if (seen.length > 100) {
        seen.shift();
    }
    localStorage.setItem('seenQuestions', JSON.stringify(seen));
}

async function initQuiz() {
    try {
        await getNextQuestion();
        loadingMessageEl.classList.add('hidden');
        questionEl.classList.remove('hidden');
        revealBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    } catch (error) {
        loadingMessageEl.textContent = 'Failed to connect to the quiz database.';
    }
}

async function getNextQuestion() {
    answerEl.classList.add('hidden');

    // If we are navigating forward through history (prev button was used)
    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
    } 
    // Otherwise, fetch a BRAND NEW random question
    else {
        try {
            // Get the list of IDs to exclude from localStorage
            const exclude = getRecentIds().join(',');
            const response = await fetch(`${FUNCTION_URL}?exclude=${exclude}`);
            
            if (!response.ok) throw new Error('Network response was not ok');

            const newQuestion = await response.json();

            // Store the rowid in localStorage to avoid repeats
            saveIdToHistory(newQuestion.rowid);

            // Store the full question in session history for the 'back' button
            questionHistory.push(newQuestion);
            currentQuestionIndex++;
            displayQuestion(newQuestion);
        } catch (error) {
            console.error("Error fetching question:", error);
            questionEl.textContent = "Error loading next question...";
        }
    }
    updateButtonVisibility();
}

function getPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(questionHistory[currentQuestionIndex]);
        updateButtonVisibility();
    }
}

function displayQuestion(question) {
    questionEl.textContent = question.question;
    answerEl.textContent = question.answer;

    if (question.image && question.image.trim() !== "") {
        questionImageEl.src = question.image;
        questionImageEl.classList.remove('hidden');
        questionImageEl.alt = "Question Image"; 
    } else {
        questionImageEl.src = "";
        questionImageEl.classList.add('hidden');
    }
}

function updateButtonVisibility() {
    // Only show/enable previous button if we aren't at the start of the session
    if (currentQuestionIndex <= 0) {
        prevBtn.classList.add('disabled-btn');
    } else {
        prevBtn.classList.remove('disabled-btn');
    }
}

// Event listeners
revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', () => getNextQuestion());
prevBtn.addEventListener('click', getPreviousQuestion);

// Start the quiz
initQuiz();