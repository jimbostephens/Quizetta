// Replace this with your Google Sheet's public CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzBEVylxJgSMmJnClnCxupXuaV_v9ybkYgPlWxiDpmqBuy4JIi3pZByHKNyY-5KQDCTUadWsRyzaZr/pub?gid=0&single=true&output=csv'; 

let questions = [];

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');

// Fetch and parse data from the Google Sheet
function fetchQuestions() {
    Papa.parse(SHEET_URL, {
        download: true,
        header: false,
        complete: function(results) {
            // The data is an array of arrays
            const data = results.data;
            
            // Map the data into an array of objects
            questions = data.slice(1).map(row => {
                // Ensure the row has a question and an answer
                if (row.length < 2 || !row[0] || !row[1]) return null;
                
                return {
                    question: row[0].trim(),
                    answer: row[1].trim()
                };
            }).filter(item => item !== null); // Filter out any bad rows

            // Check if any questions were loaded
            if (questions.length === 0) {
                questionEl.textContent = 'No questions available. Please check your sheet data.';
            } else {
                getNextQuestion();
            }
        },
        error: function(error) {
            console.error('Error fetching questions:', error);
            questionEl.textContent = 'Failed to load questions. Check the URL and sheet settings.';
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
    
    // Hide the answer element using a CSS class
    answerEl.classList.add('hidden');
}

// Event listener for the "Reveal Answer" button
revealBtn.addEventListener('click', () => {
    // Show the answer by removing the 'hidden' class
    answerEl.classList.remove('hidden');
});

// Event listener for the "Next Question" button
nextBtn.addEventListener('click', getNextQuestion);

// Initial fetch and display when the page loads
fetchQuestions();
