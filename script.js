const FUNCTION_URL = '/.netlify/functions/getQuestion';

// State management
let questionHistory = [];    // Questions seen in this current session (for Back button)
let currentQuestionIndex = -1;
let prefetchBuffer = [];     // Questions pre-loaded and ready to show
const BUFFER_SIZE = 5;       // How many questions to keep "in the chamber"
let staticFirstQuestion = null; // Holds the initial static question ID to prevent duplicates

// DOM element references
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');
const questionImageEl = document.getElementById('question-image');

/** * Persistence: Get the last 500 rowids from browser storage
 */
function getRecentIds() {
    const seen = localStorage.getItem('seenQuestions');
    return seen ? JSON.parse(seen) : [];
}

/** * Persistence: Save a rowid and keep the list capped at 500
 */
function saveIdToHistory(id) {
    if (!id) return;
    let seen = getRecentIds();
    seen.push(id);
    if (seen.length > 500) seen.shift();
    localStorage.setItem('seenQuestions', JSON.stringify(seen));
}

/**
 * Prefetching: Background fetch to fill the buffer
 */
async function fillBuffer() {
    while (prefetchBuffer.length < BUFFER_SIZE) {
        try {
            // Combine historical IDs, buffered IDs, AND the static first question ID 
            const recentIds = getRecentIds();
            const bufferedIds = prefetchBuffer.map(q => q.rowid);
            const staticId = staticFirstQuestion ? [staticFirstQuestion.rowid] : [];

            const exclude = [...new Set([...recentIds, ...bufferedIds, ...staticId])].join(',');

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
 * Startup: Handles normal layout initialization OR single question preview mode
 */
async function initQuiz() {
    try {
        // Check if there is an ?id=XYZ in the browser URL
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');

        if (targetId) {
            // --- PREVIEW MODE ---
            loadingMessageEl.classList.add('hidden');

            const response = await fetch(`${FUNCTION_URL}?id=${targetId}`);
            if (!response.ok) throw new Error('Failed to fetch specific question');

            const specificQuestion = await response.json();
            displayQuestion(specificQuestion);

            // Show buttons
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            prevBtn.classList.remove('hidden');
        } else {
            // --- STANDARD GAMEPLAY MODE ---
            try {
                // 1. Try to fetch the local static JSON
                const staticResponse = await fetch('q.json');
                if (!staticResponse.ok) throw new Error(`HTTP ${staticResponse.status}`);

                staticFirstQuestion = await staticResponse.json();

                // 2. Clear loading message and instantly show the first question
                loadingMessageEl.classList.add('hidden');

                saveIdToHistory(staticFirstQuestion.rowid);
                questionHistory.push(staticFirstQuestion);
                currentQuestionIndex++;
                displayQuestion(staticFirstQuestion);

                // 3. Reveal gameplay elements immediately
                questionEl.classList.remove('hidden');
                revealBtn.classList.remove('hidden');
                nextBtn.classList.remove('hidden');
                prevBtn.classList.remove('hidden');
                updateButtonVisibility();

                // 4. Fire off buffer prefetching quietly in the background
                fillBuffer();

            } catch (jsonError) {
                // FALLBACK: If q.json fails/404s, seamlessly revert to the database method
                console.warn("Local q.json failed, falling back to database loading:", jsonError);

                await fillBuffer();

                if (prefetchBuffer.length > 0) {
                    loadingMessageEl.classList.add('hidden');
                    await getNextQuestion(); 

                    questionEl.classList.remove('hidden');
                    revealBtn.classList.remove('hidden');
                    nextBtn.classList.remove('hidden');
                    prevBtn.classList.remove('hidden');
                } else {
                    throw new Error("Both local JSON and database buffer failed to load.");
                }
            }
        }
    } catch (error) {
        console.error("Initialization error:", error);
        loadingMessageEl.textContent = 'Failed to connect to the quiz database.';
    }
}

/**
 * Navigation: Handle the 'Next' logic
 */
async function getNextQuestion() {
    answerEl.classList.add('hidden');

    // Force the image to hide and clear its source completely
    questionImageEl.classList.add('hidden');
    questionImageEl.src = "";

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
            questionEl.textContent = "Loading questions...";
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

    // FIX: Safely checks type to ensure .trim() doesn't execute on null values
    if (question.image && typeof question.image === 'string' && question.image.trim() !== "") {
        questionImageEl.src = question.image;
        questionImageEl.classList.remove('hidden');
        questionImageEl.alt = "Question Image"; 
    } else {
        questionImageEl.src = "";
        questionImageEl.classList.add('hidden');
    }
}

/**
 * UI: Manage button states (Only used in normal gameplay)
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
