const questions = document.querySelectorAll('.section .options');
const progressBar = document.getElementById('progressBar');
const surveyForm = document.getElementById('surveyForm');
const thankYou = document.getElementById('thankYou');

let answers = {};
let answeredQuestions = new Set();
const OFFLINE_KEY = "trash-talk_offline_responses";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxQkx8vyEs7mO-orrxUSd5VJuLx3cqfoLzOJQ88kvdqpL8Lo2eZ5TuYrU23C49oLlgb-w/exec"; 


// ================= TRACK QUESTION SELECTION =================
questions.forEach((sectionOptions, qIndex) => {
  const btns = sectionOptions.querySelectorAll('.option');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      answers[`Q${qIndex+1}`] = btn.childNodes[0].textContent.trim();
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
  setTimeout(() => progressBar.style.boxShadow = "0 0 15px rgba(90,90,255,0.5)", 200);
}

// ================= LOCAL STORAGE =================
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
  if (!stored.length) return;
  stored.forEach((data, index) => {
    sendToGoogleSheet(data).then(() => stored[index] = null).catch(err => console.error(err));
  });
  stored = stored.filter(d => d !== null);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(stored));
}

window.addEventListener('online', sendAllStoredResponses);

// ================= FORM SUBMISSION =================
surveyForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const sectionInput = document.getElementById('section').value.trim();
  const warning = document.getElementById('warningMsg');
  questions.forEach(sectionOptions => sectionOptions.parentElement.classList.remove('unanswered'));

  const namePattern = /^[a-zA-Z\s,]+$/;
  if (name.length < 2 || name.length > 30 || !namePattern.test(name)) {
    warning.textContent = 'Name must be 2–30 letters and can include commas only.';
    warning.classList.remove('hidden');
    warning.classList.add('visible');
    return;
  }

  const sectionPattern = /^8\s*-\s*[a-zA-Z\s]+$/;
  if (!sectionPattern.test(sectionInput)) {
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
    setTimeout(() => { warning.classList.remove('visible'); warning.classList.add('hidden'); }, 3000);
    return;
  }

  const data = { name, section: sectionInput, ...answers };
  if (navigator.onLine) {
    try { await sendToGoogleSheet(data); } catch { saveLocally(data); }
  } else saveLocally(data);

  surveyForm.classList.add('hidden');
  thankYou.classList.remove('hidden');
  confetti();
  showResultsSummary();
});

// Example post-submit percentages
async function showResultsSummary() {
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    const totalResponses = Object.values(data['Q1']).reduce((a,b)=>a+b,0);

    questions.forEach((section, index) => {
      const qKey = `Q${index+1}`;
      const summaryEl = document.getElementById(`${qKey}-summary`);
      const questionText = section.parentElement.querySelector('p').textContent;
      const userAnswer = answers[qKey];
      const counts = data[qKey];
      const total = Object.values(counts).reduce((a,b)=>a+b,0);

      let html = `<h3>${questionText}</h3>`;
      Object.entries(counts).forEach(([option, count]) => {
        const percent = total ? Math.round((count/total)*100) : 0;
        const highlight = option === userAnswer ? 'style="background:#ffaa55"' : '';
        html += `
          <div>${option}</div>
          <div class="result-bar">
            <div class="result-fill" style="width:${percent}%;${highlight}">${percent}%</div>
          </div>
        `;
      });
      summaryEl.innerHTML = html;
    });

    document.getElementById('resultsSummary').classList.remove('hidden');
  } catch(err) {
    console.error('Failed to fetch results summary:', err);
  }
}

// ================= CONFETTI =================
function confetti() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = 0;
  container.style.left = 0;
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const colors = ['#5a5aff','#aa55ff','#55ffff','#ffaa55','#ff55aa'];
  for (let i = 0; i < 60; i++) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '10px';
    div.style.height = '10px';
    div.style.background = colors[Math.floor(Math.random()*colors.length)];
    div.style.left = Math.random()*100 + '%';
    div.style.top = '-20px';
    div.style.borderRadius = '50%';
    div.style.opacity = Math.random();
    const duration = 3 + Math.random()*2;
    div.style.animation = `fall ${duration}s linear forwards, fadeIn 0.5s ease forwards`;
    container.appendChild(div);
    setTimeout(() => div.remove(), duration*1000);
  }
  setTimeout(() => container.remove(), 5000);
}
