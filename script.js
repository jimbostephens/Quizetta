const JSON_URL = 'q.json';

// Arrays to manage question state
let allQuestions = [];
let availableQuestions = [];
let questionHistory = [];
let currentQuestionIndex = -1;

// DOM element references
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');

// Fetch and parse data from a JSON file
function fetchQuestions() {
    fetch(JSON_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allQuestions = data;
            availableQuestions = [...allQuestions];

            loadingMessageEl.classList.add('hidden');
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');

            if (availableQuestions.length === 0) {
                questionEl.textContent = 'No questions available. Please check your JSON data.';
                revealBtn.classList.add('hidden');
                nextBtn.classList.add('hidden');
            } else {
                getNextQuestion(false);
            }
        })
        .catch(error => {
            loadingMessageEl.textContent = 'Failed to load questions. Please check the URL and file format.';
        });
}

// Display a random question and hide the answer
function getNextQuestion(isFromHistory = false) {
    answerEl.classList.add('hidden');

    if (isFromHistory && currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
    } else {
        // Check if all questions have been used
        if (availableQuestions.length === 0) {
            // Reset the available questions from the main list
            availableQuestions = [...allQuestions];

            // Clear history and reset index to avoid repetition immediately
            questionHistory = [];
            currentQuestionIndex = -1;
        }

        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const newQuestion = availableQuestions.splice(randomIndex, 1)[0];
        questionHistory.push(newQuestion);
        currentQuestionIndex++;
        displayQuestion(newQuestion);
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
}

function updateButtonVisibility() {
    prevBtn.classList.toggle('disabled-btn', currentQuestionIndex <= 0);
    // The next button is always enabled unless the quiz is being reset
    nextBtn.classList.remove('hidden');
    revealBtn.classList.remove('hidden');
}

// Event listeners for the buttons
revealBtn.addEventListener('click', () => {
    answerEl.classList.remove('hidden');
});

nextBtn.addEventListener('click', () => getNextQuestion(false));

prevBtn.addEventListener('click', getPreviousQuestion);

// Initial fetch and display when the page loads
fetchQuestions();