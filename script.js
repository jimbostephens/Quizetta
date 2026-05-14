// The URL of your Netlify Function
const FUNCTION_URL = '/.netlify/functions/getQuestion';

// State management (We only need history now)
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

// Instead of downloading everything, we just grab the first question
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

// Fetch ONE random question from the server
async function getNextQuestion() {
    answerEl.classList.add('hidden');

    // If we are navigating forward through history
    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
    } 
    // Otherwise, fetch a BRAND NEW random question from SQLite
    else {
        try {
            const response = await fetch(FUNCTION_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const newQuestion = await response.json();
            
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
    prevBtn.classList.toggle('disabled-btn', currentQuestionIndex <= 0);
}

async function getNextQuestion() {
    // 1. Pull the list of seen IDs from the browser's memory
    let seenIds = JSON.parse(localStorage.getItem('quizetta_seen') || '[]');

    // 2. Fetch the next question, telling the server what to ignore
    const response = await fetch(`/.netlify/functions/get-question?exclude=${seenIds.join(',')}`);
    const data = await response.json();

    if (data && data.id) {
        // 3. Add the new ID to our list
        seenIds.push(data.id);

        // 4. Safety valve: if they've seen 90% of your 1000 questions, 
        // clear the list so the site doesn't get stuck.
        if (seenIds.length > 900) {
            seenIds = [];
        }

        localStorage.setItem('quizetta_seen', JSON.stringify(seenIds));

        // ... Your existing code to display data.question, data.answer, etc. ...
    }
}

// Event listeners
revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', () => getNextQuestion());
prevBtn.addEventListener('click', getPreviousQuestion);

// Start the quiz
initQuiz();
