const FUNCTION_URL = '/.netlify/functions/getQuestion';

// State: Load the last 100 seen IDs from storage
let seenQuestions = JSON.parse(localStorage.getItem('quizetta_seen') || '[]');

// DOM Elements
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const loadingMessageEl = document.getElementById('loading-message');
const questionImageEl = document.getElementById('question-image');

async function getNextQuestion() {
    // UI Reset
    answerEl.classList.add('hidden');
    nextBtn.disabled = true;

    try {
        // Fetch with exclusion list
        const response = await fetch(`${FUNCTION_URL}?exclude=${seenQuestions.join(',')}`);
        const data = await response.json();

        if (data && data.id) {
            // 1. Update Text Content
            questionEl.textContent = data.question;
            answerEl.textContent = data.answer;

            // 2. Handle Images (Flags/Photos)
            if (data.image && data.image.trim() !== "") {
                questionImageEl.src = data.image;
                questionImageEl.classList.remove('hidden');
            } else {
                questionImageEl.classList.add('hidden');
                questionImageEl.src = "";
            }

            // 3. Update Memory (FIFO 100 limit)
            if (!seenQuestions.includes(data.id)) {
                seenQuestions.push(data.id);
            }
            if (seenQuestions.length > 100) {
                seenQuestions.shift(); // Drop the oldest
            }
            localStorage.setItem('quizetta_seen', JSON.stringify(seenQuestions));

            // 4. Reveal UI
            loadingMessageEl.classList.add('hidden');
            questionEl.classList.remove('hidden');
            revealBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Fetch error:", error);
        questionEl.textContent = "Trouble connecting. Refreshing usually fixes this!";
    } finally {
        nextBtn.disabled = false;
    }
}

// Event Listeners
revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', getNextQuestion);

// Initial Load
getNextQuestion();
