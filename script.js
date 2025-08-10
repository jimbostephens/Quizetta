// Replace this with your Google Sheet's public CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzBEVylxJgSMmJnClnCxupXuaV_v9ybkYgPlWxiDpmqBuy4JIi3pZByHKNyY-5KQDCTUadWsRyzaZr/pub?gid=0&single=true&output=csv';  

let questions = [];

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');

// Fetch and parse data from the Google Sheet
function fetchQuestions() {
    console.log("Attempting to fetch data...");
    Papa.parse(SHEET_URL, {
        download: true,
        header: false,
        complete: function(results) {
            console.log("Data fetch complete.");
            const data = results.data;
            
            questions = data.slice(1).map(row => {
                if (row.length < 2 || !row[0] || !row[1]) return null;
                
                return {
                    question: row[0].trim(),
                    answer: row[1].trim()
                };
            }).filter(item => item !== null);

            // Hide loading message and show quiz elements
            loadingMessageEl.classList.add('hidden');
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');

            if (questions.length === 0) {
                questionEl.textContent = 'No questions available. Please check your sheet data.';
            } else {
                getNextQuestion();
            }
        },
        error: function(error) {
            console.error('Error fetching questions:', error);
            loadingMessageEl.textContent = 'Failed to load questions. Please check the URL and sheet settings.';
        }
    });
}

// Display a random question and hide the answer
function getNextQuestion() {
    if (questions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * questions.length);
    const currentQuestion = questions[randomIndex];

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
