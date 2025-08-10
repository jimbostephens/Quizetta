const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzBEVylxJgSMmJnClnCxupXuaV_v9ybkYgPlWxiDpmqBuy4JIi3pZByHKNyY-5KQDCTUadWsRyzaZr/pub?gid=0&single=true&output=csv';

let questions = [];

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
            const answerRaw = cells[1] ? cells[1] : '';
            const answer = answerRaw.replace(/^"|"$/g, '').replace(/""/g, '"').trim();

            return { question, answer };
        }).filter(item => item !== null && item.question); // Filter out nulls and rows with no question

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
        answerEl.textContent = '';
        return;
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const currentQuestion = questions[randomIndex];

    // Set the question and clear the answer from the display
    questionEl.textContent = currentQuestion.question;
    answerEl.textContent = currentQuestion.answer;
    
    // Use the `hidden` class to hide the answer
    answerEl.classList.add('hidden');
}

// Event listeners for the buttons
revealBtn.addEventListener('click', () => {
    // Reveal the answer by removing the 'hidden' class
    answerEl.classList.remove('hidden');
});

nextBtn.addEventListener('click', getNextQuestion);

// Initial fetch and display
fetchQuestions();
