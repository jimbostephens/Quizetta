const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzBEVylxJgSMmJnClnCxupXuaV_v9ybkYgPlWxiDpmqBuy4JIi3pZByHKNyY-5KQDCTUadWsRyzaZr/pub?gid=0&single=true&output=csv';

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
            // Use a more robust regex to handle commas inside quoted strings
            const cells = row.match(/(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]*))+/g);
if (!cells || cells.length < 2) return null; // Skip malformed rows

const question = cells[0].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
// Get the answer and ensure it's not null or undefined before cleaning
const answerRaw = cells[1] ? cells[1] : ''; 
const answer = answerRaw.replace(/^"|"$/g, '').replace(/""/g, '"').trim();

return { question, answer };

        }).filter(item => item !== null); // Filter out any null entries

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
