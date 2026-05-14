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
 * Initializes the quiz by fetching the very first question.
 */
async function initQuiz() {
    try {
        await getNextQuestion();
        loadingMessageEl.classList.add('hidden');
        questionEl.classList.remove('hidden');
        revealBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    } catch (error) {
        console.error("Initialization error:", error);
        loadingMessageEl.textContent = 'Failed to connect to the quiz database.';
    }
}

/**
 * Logic to handle fetching the next question, 
 * either from history or a new server request.
 */
async function getNextQuestion() {
    answerEl.classList.add('hidden');

    // Scenario A: We are navigating forward through history (user clicked 'Back' previously)
    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
    } 
    // Scenario B: We need a BRAND NEW random question from the server
    else {
        try {
            // Get the IDs of the last 100 questions to exclude them from the next draw
            const recentIds = questionHistory
                .slice(-100) 
                .map(q => q.id)
                .join(',');

            // Append the exclude list to the URL as a query parameter
            const fetchUrl = recentIds ? `${FUNCTION_URL}?exclude=${recentIds}` : FUNCTION_URL;

            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            const newQuestion = await response.json();

            // Safety check: ensure the server actually returned a question
            if (newQuestion && newQuestion.id) {
                questionHistory.push(newQuestion);
                currentQuestionIndex++;
                displayQuestion(newQuestion);
            } else {
                questionEl.textContent = "No more new questions found!";
            }
        } catch (error) {
            console.error("Error fetching question:", error);
            questionEl.textContent = "Error loading next question...";
        }
    }
    updateButtonVisibility();
}

/**
 * Moves back to the previous question in the session history.
 */
function getPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(questionHistory[currentQuestionIndex]);
        updateButtonVisibility();
    }
}

/**
 * Updates the UI with the question data.
 */
function displayQuestion(question) {
    questionEl.textContent = question.question;
    answerEl.textContent = question.answer;

    // Handle image display logic
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
 * Disables the 'Previous' button if we are at the start of the history.
 */
function updateButtonVisibility() {
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

// Kick off the script
initQuiz();
