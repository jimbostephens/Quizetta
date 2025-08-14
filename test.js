document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzBEVylxJgSMmJnClnCxupXuaV_v9ybkYgPlWxiDpmqBuy4JIi3pZByHKNyY-5KQDCTUadWsRyzaZr/pub?gid=0&single=true&output=csv';
    let questions = [];

    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const revealButton = document.getElementById('reveal-btn');
    const nextButton = document.getElementById('next-btn');

    function fetchQuestions() {
        Papa.parse(csvUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                questions = results.data;
                if (questions.length > 0) {
                    displayRandomQuestion();
                } else {
                    questionElement.textContent = "No questions found.";
                }
            },
            error: function(err, file) {
                questionElement.textContent = "Failed to load questions. Please check the network connection.";
                console.error("Error parsing CSV:", err);
            }
        });
    }

    function displayRandomQuestion() {
        if (questions.length === 0) {
            questionElement.textContent = "No questions available.";
            return;
        }
        const randomIndex = Math.floor(Math.random() * questions.length);
        const randomQuestion = questions[randomIndex];

        questionElement.textContent = randomQuestion.Question;
        answerElement.textContent = randomQuestion.Answer;
        answerElement.classList.add('hidden'); // Hide answer initially
    }

    revealButton.addEventListener('click', () => {
        answerElement.classList.remove('hidden');
    });

    nextButton.addEventListener('click', () => {
        displayRandomQuestion();
    });

    fetchQuestions();
});
