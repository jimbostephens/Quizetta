const SHEET_URL = 'q.csv'; 

// Arrays to manage question state
let allQuestions = [];
let availableQuestions = [];
let usedQuestions = [];

// DOM element references
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');

            // Initialize the quiz by populating the available questions
            availableQuestions = [...allQuestions];

            // Hide loading message and show quiz elements
            loadingMessageEl.classList.add('hidden');
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');

            if (availableQuestions.length === 0) {
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
    // If all questions have been used, reset the quiz
    if (availableQuestions.length === 0) {
        console.log("All questions used. Resetting the quiz.");
        availableQuestions = [...allQuestions];
        usedQuestions = [];
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentQuestion = availableQuestions[randomIndex];

    // Remove the question from the available list and add it to the used list
    availableQuestions.splice(randomIndex, 1);
    usedQuestions.push(currentQuestion);

    // Display the question and prepare the answer
    questionEl.textContent = currentQuestion.question;
    answerEl.textContent = currentQuestion.answer;
    answerEl.classList.add('hidden');

    console.log(`Questions remaining: ${availableQuestions.length}`);
}

// Event listeners for the "Reveal Answer" and "Next Question" buttons
revealBtn.addEventListener('click', () => {
    answerEl.classList.remove('hidden');
});

nextBtn.addEventListener('click', getNextQuestion);

// Initial fetch and display when the page loads
fetchQuestions();