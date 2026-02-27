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
  const sectionInput = document.getElementById('section').value.trim();
  const warning = document.getElementById('warningMsg');

  // Reset all section highlights
  questions.forEach(sectionOptions => {
    sectionOptions.parentElement.classList.remove('unanswered');
  });

  // --- Name Validation ---
  const namePattern = /^[a-zA-Z\s,]+$/; // letters, spaces, commas only
  if(name.length < 2 || name.length > 30 || !namePattern.test(name)){
    warning.textContent = 'Name must be 2–30 letters and can include commas only.';
    warning.classList.remove('hidden');
    warning.classList.add('visible');
    return;
  }

  // --- Section Validation ---
  const sectionPattern = /^8\s*-\s*[a-zA-Z\s]+$/; // 8 - SectionName
  if(!sectionPattern.test(sectionInput)){
    warning.textContent = 'Section must be in format "8 - SectionName" (e.g., 8 - Rambutan).';
    warning.classList.remove('hidden');
    warning.classList.add('visible');
    return;
  }

  // Check if all questions are answered
  let allAnswered = true;
  questions.forEach((sectionOptions, index) => {
    if (!answeredQuestions.has(index)) {
      allAnswered = false;
      // Highlight unanswered question
      sectionOptions.parentElement.classList.add('unanswered');
    }
  });

  if (!allAnswered) {
    warning.textContent = 'Please answer all questions before submitting.';
    warning.classList.remove('hidden');
    warning.classList.add('visible');

    setTimeout(() => {
      warning.classList.remove('visible');
      warning.classList.add('hidden');
    }, 3000);
    return;
  }

  // All validations passed → submit data
  const data = { name, section: sectionInput, ...answers };
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
