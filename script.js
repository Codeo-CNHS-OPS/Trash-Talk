const questions = document.querySelectorAll('.section .options');
const progressBar = document.getElementById('progressBar');
const surveyForm = document.getElementById('surveyForm');
const thankYou = document.getElementById('thankYou');

let answers = {};
let answeredQuestions = new Set();
const OFFLINE_KEY = "Trash-Talk_Survey";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxQkx8vyEs7mO-orrxUSd5VJuLx3cqfoLzOJQ88kvdqpL8Lo2eZ5TuYrU23C49oLlgb-w/exec";

// ================= TRACK QUESTION SELECTIONS =================
questions.forEach((sectionOptions, qIndex) => {
  const btns = sectionOptions.querySelectorAll('.option');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {

      answers[`Q${qIndex+1}`] = btn.textContent;

      btns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      answeredQuestions.add(qIndex);

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

// ================= OFFLINE STORAGE =================
function saveLocally(data) {
  let stored = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  stored.push(data);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(stored));
}

function sendToGoogleSheet(data) {
  return fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data),
  }).then(res => res.json());
}

function sendAllStoredResponses() {
  let stored = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  if(stored.length === 0) return;

  stored.forEach((data, index) => {
    sendToGoogleSheet(data).then(() => {
      stored[index] = null;
    }).catch(err => console.error("Offline submission failed:", err));
  });

  stored = stored.filter(d => d !== null);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(stored));
}

window.addEventListener('online', () => {
  sendAllStoredResponses();
});

// ================= SHARE + GOAL SYSTEM =================
function showShareSection(total) {
  const shareSection = document.getElementById('shareSection');
  const currentCount = document.getElementById('currentCount');
  const goalProgressBar = document.getElementById('goalProgressBar');
  const surveyLinkText = document.getElementById('surveyLinkText');
  const copyBtn = document.getElementById('copyBtn');

  const GOAL = 250;

  shareSection.classList.remove('hidden');

  currentCount.textContent = total;

  let percent = Math.min((total / GOAL) * 100, 100);
  goalProgressBar.style.width = percent + '%';

  const link = window.location.href;
  surveyLinkText.textContent = link;

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(link);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy Link", 2000);
  };

  new QRCode(document.getElementById("qrcode"), {
    text: link,
    width: 120,
    height: 120,
  });
}

// ================= FORM SUBMISSION =================
surveyForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const sectionInput = document.getElementById('section').value.trim();
  const warning = document.getElementById('warningMsg');

  questions.forEach(sectionOptions => 
    sectionOptions.parentElement.classList.remove('unanswered')
  );

  const namePattern = /^[a-zA-Z\s,]+$/;
  if(name.length < 2 || name.length > 30 || !namePattern.test(name)){
    warning.textContent = 'Name must be 2–30 letters and can include commas only.';
    warning.classList.remove('hidden');
    warning.classList.add('visible');
    return;
  }

  const sectionPattern = /^8\s*-\s*[a-zA-Z\s]+$/;
  if(!sectionPattern.test(sectionInput)){
    warning.textContent = 'Section must be in format "8 - SectionName" (e.g., 8 - Rambutan).';
    warning.classList.remove('hidden');
    warning.classList.add('visible');
    return;
  }

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

      if(resp.totalResponses){
        showShareSection(resp.totalResponses);
      } else {
        showShareSection(0);
      }

    }).catch(err => {
      console.error("Online submission failed, saving offline.", err);
      saveLocally(data);
      showShareSection(0);
    });
  } else {
    saveLocally(data);
    showShareSection(0);
  }

  surveyForm.classList.add('hidden');
  thankYou.classList.remove('hidden');
  confetti();
});

// ================= CONFETTI =================
function confetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = 0;
  confettiContainer.style.left = 0;
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.overflow = 'hidden';
  document.body.appendChild(confettiContainer);

  const colors = ['#5a5aff','#aa55ff','#55ffff','#ffaa55','#ff55aa'];

  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.style.position = 'absolute';
      piece.style.width = '10px';
      piece.style.height = '10px';
      piece.style.background = colors[Math.floor(Math.random()*colors.length)];
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = '-20px';
      piece.style.borderRadius = '50%';
      piece.style.opacity = 0;

      const duration = 3 + Math.random() * 2;

      piece.style.animation = `
        fall ${duration}s linear forwards,
        fadeIn 0.5s ease forwards
      `;

      confettiContainer.appendChild(piece);

      setTimeout(() => {
        piece.remove();
      }, duration * 1000);

    }, i * 30);
  }

  setTimeout(() => {
    confettiContainer.remove();
  }, 5000);
}
