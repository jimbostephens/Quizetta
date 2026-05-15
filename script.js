// The URL of your Netlify Function
const FUNCTION_URL = '/.netlify/functions/getQuestion';

// State management
let questionHistory = [];    // Questions seen in this current session (for the Back button)
let currentQuestionIndex = -1;
let prefetchBuffer = [];     // Questions pre-loaded and ready to show
const BUFFER_SIZE = 3;       // How many questions to keep "in the chamber"

// DOM element references
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');
const questionImageEl = document.getElementById('question-image');

/** 
 * Persistence: Get the last 100 rowids from browser storage
 */
function getRecentIds() {
    const seen = localStorage.getItem('seenQuestions');
    return seen ? JSON.parse(seen) : [];
}

/** 
 * Persistence: Save a rowid and keep the list capped at 100
 */
function saveIdToHistory(id) {
    if (!id) return;
    let seen = getRecentIds();
    seen.push(id);
    if (seen.length > 100) seen.shift();
    localStorage.setItem('seenQuestions', JSON.stringify(seen));
}

/**
 * Prefetching: Background fetch to fill the buffer
 */
async function fillBuffer() {
    while (prefetchBuffer.length < BUFFER_SIZE) {
        try {
            // Combine historical IDs and IDs already waiting in the buffer to avoid duplicates
            const recentIds = getRecentIds();
            const bufferedIds = prefetchBuffer.map(q => q.rowid);
            const exclude = [...new Set([...recentIds, ...bufferedIds])].join(',');

            const response = await fetch(`${FUNCTION_URL}?exclude=${exclude}`);
            if (!response.ok) throw new Error('Fetch failed');
            
            const newQuestion = await response.json();
            prefetchBuffer.push(newQuestion);
        } catch (error) {
            console.error("Prefetching error:", error);
            break; // Stop loop on error to prevent infinite calls
        }
    }
}

/**
 * Startup: Fill the buffer then show the first question
 */
async function initQuiz() {
    try {
        await fillBuffer();
        
        if (prefetchBuffer.length > 0) {
            loadingMessageEl.classList.add('hidden');
            await getNextQuestion(); 
            
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
        }
    } catch (error) {
        loadingMessageEl.textContent = 'Failed to connect to the quiz database.';
    }
}

/**
 * Navigation: Handle the 'Next' logic
 */
async function getNextQuestion() {
    answerEl.classList.add('hidden');

    // Case 1: User clicked 'Back' previously and is now going 'Forward' through existing session history
    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
    } 
    // Case 2: User needs a brand new question (Pull from buffer)
    else {
        if (prefetchBuffer.length > 0) {
            const newQuestion = prefetchBuffer.shift();
            
            saveIdToHistory(newQuestion.rowid);
            questionHistory.push(newQuestion);
            currentQuestionIndex++;
            displayQuestion(newQuestion);
            
            // Refill the buffer in the background while user reads
            fillBuffer(); 
        } else {
            // Emergency fallback if buffer is empty
            questionEl.textContent = "Loading...";
            await fillBuffer();
            if (prefetchBuffer.length > 0) getNextQuestion();
        }
    }
    updateButtonVisibility();
}

/**
 * Navigation: Handle the 'Back' logic
 */
function getPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(questionHistory[currentQuestionIndex]);
        updateButtonVisibility();
    }
}

/**
 * UI: Render the question data to the page
 */
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

/**
 * UI: Manage button states
 */
function updateButtonVisibility() {
    prevBtn.classList.toggle('disabled-btn', currentQuestionIndex <= 0);
}

// Event listeners
revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', () => getNextQuestion());
prevBtn.addEventListener('click', getPreviousQuestion);

// Start the quiz
initQuiz();
