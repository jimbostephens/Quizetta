const FUNCTION_URL = '/.netlify/functions/getQuestion';

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');

// State management
let seenQuestions = JSON.parse(localStorage.getItem('quizetta_seen') || '[]');

async function getNextQuestion() {
    answerEl.classList.add('hidden');
    nextBtn.disabled = true; // Prevent double-clicks

    try {
        // Send our "seen" list to the server
        const response = await fetch(`${FUNCTION_URL}?exclude=${seenQuestions.join(',')}`);
        const data = await response.json();

        if (data && data.id) {
            // Update UI
            questionEl.textContent = data.question;
            answerEl.textContent = data.answer;
            
            // Manage Memory (The 100-limit logic)
            seenQuestions.push(data.id);
            if (seenQuestions.length > 100) {
                seenQuestions.shift(); // Remove the oldest ID
            }
            localStorage.setItem('quizetta_seen', JSON.stringify(seenQuestions));

            // Show content
            loadingMessageEl.classList.add('hidden');
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error:", error);
        questionEl.textContent = "Connection issue. Try refreshing!";
    } finally {
        nextBtn.disabled = false;
    }
}

revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', getNextQuestion);

// Start the first question
getNextQuestion();
