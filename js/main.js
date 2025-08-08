let currentAnswer = '';

async function fetchQuestion() {
  document.getElementById('answer').style.display = 'none';
  document.getElementById('revealAnswer').disabled = false;
  const res = await fetch('/api/question');
  const data = await res.json();
  document.getElementById('question').textContent = data.question;
  document.getElementById('answer').textContent = data.answer;
  currentAnswer = data.answer;
}

document.getElementById('revealAnswer').onclick = () => {
  document.getElementById('answer').style.display = 'block';
  document.getElementById('revealAnswer').disabled = true;
};

document.getElementById('nextQuestion').onclick = fetchQuestion;

fetchQuestion();