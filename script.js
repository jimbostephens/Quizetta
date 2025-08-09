// Replace this URL with the one you got from publishing your Google Sheet
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzBEVylxJgSMmJnClnCxupXuaV_v9ybkYgPlWxiDpmqBuy4JIi3pZByHKNyY-5KQDCTUadWsRyzaZr';

let questions = [];
let currentQuestionIndex = -1;

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');

// Fetch the data from the Google Sheet
async function fetchQuestions() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const rows = text.trim().split('\n').slice(1); // Skip header row

        questions = rows.map(row => {
            const [question, answer] = row.split(',');
            return { question: question.trim(), answer: answer.trim() };
        });

        getNextQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionEl.textContent = 'Failed to load questions. Please check the Google Sheet URL.';
    }
}

// Display a random question
function getNextQuestion() {
    if (questions.length === 0) {
        questionEl.textContent = 'No questions available.';
        return;
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestionIndex = randomIndex;

    questionEl.textContent = questions[currentQuestionIndex].question;
    answerEl.textContent = questions[currentQuestionIndex].answer;
    answerEl.classList.add('hidden'); // Hide the answer initially
}

// Event listeners for the buttons
revealBtn.addEventListener('click', () => {
    answerEl.classList.remove('hidden');
});

nextBtn.addEventListener('click', getNextQuestion);

// Initial fetch and display
fetchQuestions();
