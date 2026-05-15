const FUNCTION_URL = '/.netlify/functions/getQuestion';

// State management
let questionHistory = []; // Questions already seen in this session
let currentQuestionIndex = -1;
let prefetchBuffer = []; // Questions waiting to be shown
const BUFFER_SIZE = 3; // Keep 3 questions ready at all times

// DOM elements (keeping your existing ones)
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');
const questionImageEl = document.getElementById('question-image');

// Helper for LocalStorage (same as before)
function getRecentIds() {
    const seen = localStorage.getItem('seenQuestions');
    return seen ? JSON.parse(seen) : [];
}

function saveIdToHistory(id) {
    if (!id) return;
    let seen = getRecentIds();
    seen.push(id);
    if (seen.length > 100) seen.shift();
    localStorage.setItem('seenQuestions', JSON.stringify(seen));
}

// 1. New Prefetch Logic
async function fillBuffer() {
    // Fill the buffer until it reaches the desired size
    while (prefetchBuffer.length < BUFFER_SIZE) {
        try {
            // Include IDs from localStorage AND IDs currently in the prefetch buffer
            const recentIds = getRecentIds();
            const bufferedIds = prefetchBuffer.map(q => q.rowid);
            const exclude = [...new Set([...recentIds, ...bufferedIds])].join(',');

            const response = await fetch(`${FUNCTION_URL}?exclude=${exclude}`);
            if (!response.ok) throw new Error('Fetch failed');
            
            const newQuestion = await response.json();
            prefetchBuffer.push(newQuestion);
        } catch (error) {
            console.error("Prefetch error:", error);
            break; // Stop trying if there's an error
        }
    }
}

async function initQuiz() {
    try {
        // Initial load: get enough to start the quiz
        await fillBuffer();
        
        if (prefetchBuffer.length > 0) {
            loadingMessageEl.classList.add('hidden');
            // Move the first buffered item to the display
            await getNextQuestion(); 
            
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
        }
    } catch (error) {
        loadingMessageEl.textContent = 'Failed to connect to the quiz database.';
    }
}

async function getNextQuestion() {
    answerEl.classList.add('hidden');

    // Case A: Moving forward through session history (back button was used)
    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
    } 
    // Case B: Need a new question
    else {
        if (prefetchBuffer.length > 0) {
            // Pull from our pre-loaded buffer (INSTANT)
            const newQuestion = prefetchBuffer.shift();
            
            saveIdToHistory(newQuestion.rowid);
            questionHistory.push(newQuestion);
            currentQuestionIndex++;
            displayQuestion(newQuestion);
            
            // Refill the buffer in the background
            fillBuffer(); 
        } else {
            // Fallback if buffer is empty (shouldn't happen often)
            questionEl.textContent = "Loading...";
            await fillBuffer();
            if (prefetchBuffer.length > 0) getNextQuestion();
        }
    }
    updateButtonVisibility();
}
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