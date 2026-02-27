const questions = document.querySelectorAll('.section .options');
const progressBar = document.getElementById('progressBar');
const surveyForm = document.getElementById('surveyForm');
const thankYou = document.getElementById('thankYou');

let answers = {};
let answeredQuestions = new Set();

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

      // Animate progress bar "dopamine effect"
      updateProgress();
      animateProgressGlow();
    });
  });
});

function updateProgress() {
  let percent = (answeredQuestions.size / questions.length) * 100;
  progressBar.style.width = percent + '%';
}

function animateProgressGlow() {
  progressBar.style.boxShadow = "0 0 25px rgba(90,90,255,0.7)";
  setTimeout(() => {
    progressBar.style.boxShadow = "0 0 15px rgba(90,90,255,0.5)";
  }, 200);
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

  surveyForm.classList.add('hidden');
  thankYou.classList.remove('hidden');

  confetti();
});

// Dopamine confetti effect
function confetti(){
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = 0;
  confettiContainer.style.left = 0;
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  document.body.appendChild(confettiContainer);

  for(let i=0;i<60;i++){
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '10px';
    div.style.height = '10px';
    // subtle jewel-tone colors for elegant dopamine feel
    const colors = ['#5a5aff','#aa55ff','#55ffff','#ffaa55','#ff55aa'];
    div.style.background = colors[Math.floor(Math.random()*colors.length)];
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
      } else div.style.top = top + Math.random()*8 + 'px';
    }, 20);
  }

  setTimeout(()=>confettiContainer.remove(), 3500);
}
