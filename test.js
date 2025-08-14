const JSON_URL = 'q.json';

// Arrays to manage question state
let allQuestions = [];
let availableQuestions = [];

// DOM element references
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
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
            } else {
                getNextQuestion();
            }
        })
        .catch(error => {
            loadingMessageEl.textContent = 'Failed to load questions. Please check the URL and file format.';
        });
}

// Display a random question and hide the answer
function getNextQuestion() {
    if (availableQuestions.length === 0) {
        availableQuestions = [...allQuestions];
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentQuestion = availableQuestions[randomIndex];

    availableQuestions.splice(randomIndex, 1);

    questionEl.textContent = currentQuestion.question;
    answerEl.textContent = currentQuestion.answer;
    answerEl.classList.add('hidden');
}

// Event listeners for the "Reveal Answer" and "Next Question" buttons
revealBtn.addEventListener('click', () => {
    answerEl.classList.remove('hidden');
});

nextBtn.addEventListener('click', getNextQuestion);

// Initial fetch and display when the page loads
fetchQuestions();
