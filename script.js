const FUNCTION_URL = 'https://quizetta.netlify.app/.netlify/functions/getQuestion';

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
        console.error("Init error:", error);
        loadingMessageEl.textContent = 'Failed to connect to the quiz database.';
    }
}

async function getNextQuestion() {
    // Disable button briefly to prevent "double-click" faff
    nextBtn.disabled = true;
    answerEl.classList.add('hidden');

    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
        nextBtn.disabled = false;
    } else {
        try {
            const seenIds = JSON.parse(localStorage.getItem('quizetta_seen') || '[]');
            const response = await fetch(`${FUNCTION_URL}?exclude=${seenIds.join(',')}`);

            if (!response.ok) throw new Error('Server error');
            const newQuestion = await response.json();

            if (newQuestion && newQuestion.id) {
                seenIds.push(newQuestion.id);
                // Keep the "seen" list manageable
                const updatedSeen = seenIds.length > 800 ? [] : seenIds;
                localStorage.setItem('quizetta_seen', JSON.stringify(updatedSeen));

                questionHistory.push(newQuestion);
                currentQuestionIndex++;
                displayQuestion(newQuestion);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            questionEl.textContent = "Connection lost. Try refreshing?";
        } finally {
            nextBtn.disabled = false;
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
    if (!question) return;
    questionEl.textContent = question.question;
    answerEl.textContent = question.answer;
    answerEl.classList.add('hidden');

    if (question.image && question.image.trim() !== "") {
        questionImageEl.src = question.image;
        questionImageEl.classList.remove('hidden');
    } else {
        questionImageEl.classList.add('hidden');
        questionImageEl.src = "";
    }
}

function updateButtonVisibility() {
    prevBtn.classList.toggle('disabled-btn', currentQuestionIndex <= 0);
}

// Event Listeners
revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', getNextQuestion);
prevBtn.addEventListener('click', getPreviousQuestion);

// Keyboard Shortcuts (ArrowDown to reveal)
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        answerEl.classList.remove('hidden');
    } else if (e.code === 'ArrowRight' || e.code === 'Enter') {
        e.preventDefault();
        getNextQuestion();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        getPreviousQuestion();
    }
});

initQuiz();
