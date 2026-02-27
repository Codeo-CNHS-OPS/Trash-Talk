const questions = document.querySelectorAll('.section .options');
const progressBar = document.getElementById('progressBar');
const surveyForm = document.getElementById('surveyForm');
const thankYou = document.getElementById('thankYou');

let answers = {};
let answeredQuestions = new Set();
const OFFLINE_KEY = "opinify_offline_responses";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxQkx8vyEs7mO-orrxUSd5VJuLx3cqfoLzOJQ88kvdqpL8Lo2eZ5TuYrU23C49oLlgb-w/exec";

// Track question selections
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

// Save a single response locally
function saveLocally(data) {
  let stored = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  stored.push(data);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(stored));
}

// Send a single response to Google Sheets
function sendToGoogleSheet(data) {
  return fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
  }).then(res => res.json());
}

// Attempt to send all offline responses
function sendAllStoredResponses() {
  let stored = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  if(stored.length === 0) return;

  stored.forEach((data, index) => {
    sendToGoogleSheet(data).then(() => {
      stored[index] = null; // mark as sent
    }).catch(err => console.error("Offline submission failed:", err));
  });

  // Remove sent items
  stored = stored.filter(d => d !== null);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(stored));
}

// Auto-sync when online
window.addEventListener('online', () => {
  sendAllStoredResponses();
});

// Form submission
surveyForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const sectionInput = document.getElementById('section').value.trim();
  const warning = document.getElementById('warningMsg');

  // Reset highlights
  questions.forEach(sectionOptions => sectionOptions.parentElement.classList.remove('unanswered'));

  // --- Name Validation ---
  const namePattern = /^[a-zA-Z\s,]+$/;
  if(name.length < 2 || name.length > 30 || !namePattern.test(name)){
    warning.textContent = 'Name must be 2–30 letters and can include commas only.';
    warning.classList.remove('hidden');
    warning.classList.add('visible');
    return;
  }

  // --- Section Validation ---
  const sectionPattern = /^8\s*-\s*[a-zA-Z\s]+$/;
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

  const data = { name, section: sectionInput, ...answers };

  if(navigator.onLine){
    sendToGoogleSheet(data).then(resp => {
      console.log("Submitted:", resp);
    }).catch(err => {
      console.error("Online submission failed, saving offline.", err);
      saveLocally(data);
    });
  } else {
    saveLocally(data);
  }

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
