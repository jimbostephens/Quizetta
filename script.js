const FUNCTION_URL = '/.netlify/functions/getQuestion';

// State management
let questionHistory = [];
let currentQuestionIndex = -1;

// DOM elements
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');
const questionImageEl = document.getElementById('question-image');

async function initQuiz() {
    try {
        await getNextQuestion();
        loadingMessageEl.classList.add('hidden');
        [questionEl, revealBtn, nextBtn].forEach(el => el.classList.remove('hidden'));
    } catch (error) {
        loadingMessageEl.textContent = 'Failed to connect to the quiz database.';
    }
}

async function getNextQuestion() {
    answerEl.classList.add('hidden');

    // Scenario A: Navigating forward through already-fetched history
    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
    } 
    // Scenario B: Fetching a brand new question from the server
    else {
        try {
            const seenIds = JSON.parse(localStorage.getItem('quizetta_seen') || '[]');
            const response = await fetch(`${FUNCTION_URL}?exclude=${seenIds.join(',')}`);
            
            if (!response.ok) throw new Error('Network response error');
            const newQuestion = await response.json();

            // Save to memory (Anti-repeat)
            seenIds.push(newQuestion.id);
            if (seenIds.length > 800) localStorage.setItem('quizetta_seen', '[]'); // Reset if pool is exhausted
            else localStorage.setItem('quizetta_seen', JSON.stringify(seenIds));

            // Save to session history (Back button)
            questionHistory.push(newQuestion);
            currentQuestionIndex++;
            displayQuestion(newQuestion);
        } catch (error) {
            console.error("Fetch error:", error);
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
    answerEl.classList.add('hidden'); // Hide answer when switching questions

    if (question.image && question.image.trim() !== "") {
        questionImageEl.src = question.image;
        questionImageEl.classList.remove('hidden');
    } else {
        questionImageEl.classList.add('hidden');
    }
}

function updateButtonVisibility() {
    prevBtn.classList.toggle('disabled-btn', currentQuestionIndex <= 0);
}

// Event Listeners
revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', getNextQuestion);
prevBtn.addEventListener('click', getPreviousQuestion);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        answerEl.classList.remove('hidden');
    } else if (e.code === 'ArrowRight' || e.code === 'Enter') {
        getNextQuestion();
    } else if (e.code === 'ArrowLeft') {
        getPreviousQuestion();
    }
});

initQuiz();
