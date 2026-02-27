const questions = document.querySelectorAll('.section .options');
const progressBar = document.getElementById('progressBar');
const surveyForm = document.getElementById('surveyForm');
const thankYou = document.getElementById('thankYou');

let answers = {}; // store answers per question
let answeredQuestions = new Set(); // track which questions have at least 1 answer

questions.forEach((sectionOptions, qIndex) => {
  const btns = sectionOptions.querySelectorAll('.option');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Record answer
      answers[`Q${qIndex+1}`] = btn.textContent;

      // Update selection UI
      btns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Track answered questions
      answeredQuestions.add(qIndex);

      // Update progress bar
      updateProgress();
    });
  });
});

function updateProgress() {
  let percent = (answeredQuestions.size / questions.length) * 100;
  progressBar.style.width = percent + '%';
}

surveyForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const section = document.getElementById('section').value.trim();
  if (!name || !section) {
    alert('Please fill your name and section.');
    return;
  }

  const data = { name, section, ...answers };
  console.log('Submitted:', data);

  // Show thank you
  surveyForm.classList.add('hidden');
  thankYou.classList.remove('hidden');

  // Confetti effect
  confetti();
});

// Tiny confetti effect
function confetti(){
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = 0;
  confettiContainer.style.left = 0;
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  document.body.appendChild(confettiContainer);

  for(let i=0;i<50;i++){
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '8px';
    div.style.height = '8px';
    div.style.background = `hsl(${Math.random()*360}, 70%, 50%)`;
    div.style.left = Math.random()*100 + '%';
    div.style.top = '-10px';
    div.style.borderRadius = '50%';
    div.style.opacity = Math.random();
    div.style.transform = `rotate(${Math.random()*360}deg)`;
    confettiContainer.appendChild(div);

    let fall = setInterval(()=>{
      let top = parseFloat(div.style.top);
      if(top > window.innerHeight){
        div.remove();
        clearInterval(fall);
      } else div.style.top = top + Math.random()*5 + 'px';
    }, 20);
  }

  setTimeout(()=>confettiContainer.remove(), 3000);
}
