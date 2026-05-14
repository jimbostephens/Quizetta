const FUNCTION_URL = '/.netlify/functions/getQuestion'; 

let questionHistory = [];
let currentQuestionIndex = -1;

// Elements
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const loadingMessageEl = document.getElementById('loading-message');
const questionImageEl = document.getElementById('question-image');

async function initQuiz() {
    try {
        await getNextQuestion();
        loadingMessageEl.classList.add('hidden');
        [questionEl, revealBtn, nextBtn].forEach(el => el.classList.remove('hidden'));
    } catch (e) {
        loadingMessageEl.textContent = 'Server busy. Please refresh.';
    }
}

async function getNextQuestion() {
    nextBtn.disabled = true; 
    answerEl.classList.add('hidden');

    if (currentQuestionIndex < questionHistory.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionHistory[currentQuestionIndex]);
        nextBtn.disabled = false;
    } else {
        try {
            const seen = JSON.parse(localStorage.getItem('quizetta_seen') || '[]');
            const response = await fetch(`${FUNCTION_URL}?exclude=${seen.join(',')}`);
            
            if (!response.ok) throw new Error();
            const data = await response.json();

            if (data && data.id) {
                seen.push(data.id);
                localStorage.setItem('quizetta_seen', JSON.stringify(seen.length > 800 ? [] : seen));
                questionHistory.push(data);
                currentQuestionIndex++;
                displayQuestion(data);
            }
        } catch (err) {
            questionEl.textContent = "Trouble connecting. Refreshing usually fixes this!";
        } finally {
            nextBtn.disabled = false;
        }
    }
    updateButtonVisibility();
}

function displayQuestion(q) {
    questionEl.textContent = q.question;
    answerEl.textContent = q.answer;
    if (q.image) {
        questionImageEl.src = q.image;
        questionImageEl.classList.remove('hidden');
    } else {
        questionImageEl.classList.add('hidden');
    }
}

function updateButtonVisibility() {
    prevBtn.classList.toggle('disabled-btn', currentQuestionIndex <= 0);
}

// Controls
revealBtn.addEventListener('click', () => answerEl.classList.remove('hidden'));
nextBtn.addEventListener('click', getNextQuestion);
prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(questionHistory[currentQuestionIndex]);
        updateButtonVisibility();
    }
});

// Mobile-friendly Keyboard support (for those with BT keyboards/tablets)
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowDown') { e.preventDefault(); answerEl.classList.remove('hidden'); }
    if (e.code === 'ArrowRight' || e.code === 'Enter') { e.preventDefault(); getNextQuestion(); }
    if (e.code === 'ArrowLeft') { 
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(questionHistory[currentQuestionIndex]);
            updateButtonVisibility();
        }
    }
});

initQuiz();
