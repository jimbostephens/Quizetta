const SHEET_URL = 'YOUR_GOOGLE_SHEET_CSV_URL'; // <-- Make sure this is correct

let questions = [];

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');

// Fetch data from the Google Sheet
async function fetchQuestions() {
    console.log("Fetching questions from URL:", SHEET_URL); // Debugging line
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const rows = text.trim().split('\n').slice(1); // Skip header row

        questions = rows.map(row => {
            const cells = row.match(/(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]*))+/g);
            if (!cells || cells.length < 2) return null;

            const question = cells[0].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
            const answerRaw = cells[1] ? cells[1] : '';
            const answer = answerRaw.replace(/^"|"$/g, '').replace(/""/g, '"').trim();

            return { question, answer };
        }).filter(item => item !== null && item.question);

        console.log("Successfully fetched questions:", questions); // Debugging line
        getNextQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionEl.textContent = 'Failed to load questions. Please check the Google Sheet URL and ensure it\'s published correctly.';
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

    console.log("Current Question:", currentQuestion.question); // Debugging line
    console.log("Current Answer:", currentQuestion.answer); // Debugging line

    questionEl.textContent = currentQuestion.question;
    answerEl.textContent = currentQuestion.answer;
    
    // Hide the answer
    answerEl.classList.add('hidden');
}

// Event listeners for the buttons
revealBtn.addEventListener('click', () => {
    console.log("Reveal button clicked."); // Debugging line
    answerEl.classList.remove('hidden');
});

nextBtn.addEventListener('click', getNextQuestion);

// Initial fetch and display
fetchQuestions();
