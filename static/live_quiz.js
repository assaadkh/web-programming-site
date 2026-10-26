// ======================================================
// GIN446 — Week 7: Live Quiz with Fetch API
// Dynamic quiz loading questions asynchronously from Flask API
// ======================================================

// ======================================================
// APPLICATION STATE
// ======================================================
let total = 0;             // how many questions (from the server)
const cache = {};          // cache[i] = a fetched question object
let currentQuestion = 0;
const userAnswers = [];    // user selected answer indices
let isFetching = false;    // in-flight fetch guard to prevent race conditions
let quizSubmitted = false; // whether the quiz has been submitted

// ======================================================
// FETCH WITH CACHE HELPER
// ======================================================
async function getQuestion(index) {
  // 1. If this question is already in cache, return the cached copy
  if (cache[index]) {
    return cache[index];
  }

  // 2. Otherwise fetch it from `/api/question/${index}` (relative URL)
  const response = await fetch(`/api/question/${index}`);

  // 3. Check response.ok; if the request failed, throw an error
  if (!response.ok) {
    throw new Error(`Failed to load question ${index + 1} (HTTP ${response.status})`);
  }

  // 4. Read the JSON, store it in cache[index], and return it
  const data = await response.json();
  cache[index] = data;
  return data;
}

// ======================================================
// USER ANSWER HANDLING
// ======================================================
function saveAnswer(choiceIndex) {
  if (quizSubmitted) return; // Read-only once submitted
  userAnswers[currentQuestion] = choiceIndex;
  updateHighway();
}

async function jumpToQuestion(index) {
  if (index >= 0 && index < total) {
    currentQuestion = index;
    if (quizSubmitted) {
      // In review mode: show question panel and provide a quick return button
      document.getElementById("resultsPanel").style.display = "none";
      document.getElementById("quizPanel").style.display = "block";
      const backBtn = document.getElementById("backToResultsBtn");
      if (backBtn) backBtn.style.display = "inline-flex";
      const submitBtn = document.getElementById("submitBtn");
      if (submitBtn) submitBtn.style.display = "none";
    }
    await renderQuestion();
  }
}

function backToResults() {
  document.getElementById("quizPanel").style.display = "none";
  document.getElementById("resultsPanel").style.display = "block";
}

// ======================================================
// NAVIGATION (ASYNC)
// ======================================================
async function goNext() {
  if (currentQuestion < total - 1) {
    currentQuestion++;
    await renderQuestion();
  }
}

async function goPrevious() {
  if (currentQuestion > 0) {
    currentQuestion--;
    await renderQuestion();
  }
}

async function goFirst() {
  currentQuestion = 0;
  await renderQuestion();
}

async function goLast() {
  if (total > 0) {
    currentQuestion = total - 1;
    await renderQuestion();
  }
}

// ======================================================
// CALCULATE SCORE & PERCENTAGE (ASYNC)
// ======================================================
async function calculateScore() {
  let score = 0;
  for (let i = 0; i < total; i++) {
    const q = await getQuestion(i);
    if (userAnswers[i] === q.answer) {
      score++;
    }
  }
  return score;
}

function calculatePercentage(score) {
  if (total === 0) {
    return 0;
  }
  return Math.round((score / total) * 100);
}

function getPerformanceMessage(percentage) {
  if (percentage >= 80) {
    return "Excellent";
  } else if (percentage >= 60) {
    return "Good";
  } else if (percentage >= 50) {
    return "Pass";
  } else {
    return "Needs improvement";
  }
}

// ======================================================
// BUILD CORRECTION (ASYNC)
// ======================================================
async function buildCorrection() {
  let correction = "";

  for (let i = 0; i < total; i++) {
    const q = await getQuestion(i);
    let userAnswer = "Not answered";

    if (userAnswers[i] !== undefined) {
      userAnswer = q.choices[userAnswers[i]];
    }

    const correctAnswer = q.choices[q.answer];
    let result = "Incorrect";
    if (userAnswers[i] === q.answer) {
      result = "Correct";
    }

    correction += `Question ${i + 1}: ${q.question}\n\n`;
    correction += `Your answer: ${userAnswer}\n`;
    correction += `Correct answer: ${correctAnswer}\n`;
    correction += `Result: ${result}\n`;
    correction += `Explanation: ${q.explanation}\n`;

    if (i < total - 1) {
      correction += "\n--------------------------------------------------\n\n";
    }
  }

  return correction;
}

// ======================================================
// SUBMIT QUIZ (ASYNC)
// ======================================================
async function submitQuiz() {
  if (quizSubmitted) return;

  // Confirmation warning if questions are left unanswered
  const answeredCount = userAnswers.filter((a) => a !== undefined).length;
  if (answeredCount < total) {
    const confirmed = window.confirm(
      `You have answered ${answeredCount} of ${total} question(s).\n\nAre you sure you want to submit?`
    );
    if (!confirmed) {
      return;
    }
  }

  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");

  try {
    if (loadingEl) loadingEl.hidden = false;
    if (errorEl) errorEl.hidden = true;

    const score = await calculateScore();
    const percentage = calculatePercentage(score);
    const message = getPerformanceMessage(percentage);
    const correction = await buildCorrection();

    await showResults(score, percentage, message, correction);
  } catch (err) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = `Error calculating results: ${err.message}`;
    }
  } finally {
    if (loadingEl) loadingEl.hidden = true;
  }
}

// ======================================================
// RETAKE QUIZ (RESET APPLICATION STATE)
// ======================================================
function retakeQuiz() {
  userAnswers.length = 0;
  currentQuestion = 0;
  quizSubmitted = false;

  const backBtn = document.getElementById("backToResultsBtn");
  if (backBtn) backBtn.style.display = "none";
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.style.display = "block";

  // Reset highway stations styling
  for (let i = 0; i < total; i++) {
    const cp = document.getElementById(`checkpoint-${i}`);
    if (cp) {
      cp.classList.remove("answered", "result-correct", "result-incorrect", "active-step");
      cp.removeAttribute("title");
    }
  }

  document.getElementById("resultsPanel").style.display = "none";
  document.getElementById("quizPanel").style.display = "block";

  renderQuestion();
}

// ======================================================
// RENDER QUESTION (ASYNC WITH LOADING / ERROR STATES)
// ======================================================
async function renderQuestion() {
  if (isFetching) return;
  isFetching = true;

  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");

  try {
    // 1. Show loading indicator and clear previous errors
    if (loadingEl) loadingEl.hidden = false;
    if (errorEl) errorEl.hidden = true;

    // 2. Await fetching question data
    const q = await getQuestion(currentQuestion);

    // 3. Render progress and question text
    document.getElementById("progress").textContent =
      `Question ${currentQuestion + 1} of ${total}`;
    document.getElementById("questionText").textContent = q.question;

    // 4. Render choices
    const choicesContainer = document.getElementById("choices");
    choicesContainer.innerHTML = "";

    for (let i = 0; i < q.choices.length; i++) {
      const label = document.createElement("label");
      label.className = "choice";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "answer";
      radio.value = i;

      if (quizSubmitted) {
        radio.disabled = true;
      }

      if (userAnswers[currentQuestion] === i) {
        radio.checked = true;
      }

      radio.onclick = function () {
        saveAnswer(i);
      };

      label.appendChild(radio);
      label.appendChild(document.createTextNode(" " + q.choices[i]));
      choicesContainer.appendChild(label);
    }

    // 5. Update navigation button states
    document.getElementById("firstBtn").disabled = currentQuestion === 0;
    document.getElementById("previousBtn").disabled = currentQuestion === 0;
    document.getElementById("nextBtn").disabled = currentQuestion === total - 1;
    document.getElementById("lastBtn").disabled = currentQuestion === total - 1;

    // 6. Update highway stepper
    updateHighway();
  } catch (err) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = `Error loading question: ${err.message}`;
    }
  } finally {
    isFetching = false;
    // Always hide loading indicator when done
    if (loadingEl) loadingEl.hidden = true;
  }
}

// ======================================================
// TIMELINE ROADWAY / HIGHWAY
// ======================================================
function initHighway() {
  const highway = document.getElementById("questionHighway");
  if (!highway) return;
  highway.innerHTML = "";

  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "stepper-checkpoint";
    btn.id = `checkpoint-${i}`;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-label", `Jump to Question ${i + 1}`);
    btn.onclick = function () {
      jumpToQuestion(i);
    };

    const node = document.createElement("span");
    node.className = "checkpoint-node";

    const card = document.createElement("span");
    card.className = "checkpoint-card";

    const step = document.createElement("span");
    step.className = "checkpoint-step";
    step.textContent = `Q${i + 1}`;

    card.appendChild(step);
    btn.appendChild(node);
    btn.appendChild(card);
    highway.appendChild(btn);
  }
}

function updateHighway() {
  for (let i = 0; i < total; i++) {
    const cp = document.getElementById(`checkpoint-${i}`);
    if (!cp) continue;

    if (i === currentQuestion) {
      cp.classList.add("active-step");
      cp.setAttribute("aria-selected", "true");
    } else {
      cp.classList.remove("active-step");
      cp.setAttribute("aria-selected", "false");
    }

    if (!quizSubmitted) {
      if (userAnswers[i] !== undefined) {
        cp.classList.add("answered");
      } else {
        cp.classList.remove("answered");
      }
    }
  }

  // Smoothly center active station horizontally on narrow screens
  const activeCp = document.getElementById(`checkpoint-${currentQuestion}`);
  const highway = document.getElementById("questionHighway");
  if (activeCp && highway) {
    const cRect = highway.getBoundingClientRect();
    const eRect = activeCp.getBoundingClientRect();
    if (eRect.left < cRect.left || eRect.right > cRect.right) {
      const targetLeft =
        highway.scrollLeft + (eRect.left - cRect.left) - cRect.width / 2 + eRect.width / 2;
      highway.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  }
}

// ======================================================
// DISPLAY RESULTS (ASYNC)
// ======================================================
async function showResults(score, percentage, message, correction) {
  quizSubmitted = true;
  document.getElementById("quizPanel").style.display = "none";
  document.getElementById("resultsPanel").style.display = "block";

  const backBtn = document.getElementById("backToResultsBtn");
  if (backBtn) backBtn.style.display = "inline-flex";
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.style.display = "none";

  document.getElementById("scoreText").textContent =
    `Score: ${score} / ${total}`;
  document.getElementById("percentageText").textContent =
    `Percentage: ${percentage}%`;
  document.getElementById("performanceText").textContent = message;
  document.getElementById("correction").textContent = correction;

  // Update highway stations with test results (Green for correct, Red for incorrect)
  for (let i = 0; i < total; i++) {
    const cp = document.getElementById(`checkpoint-${i}`);
    if (!cp) continue;
    cp.classList.remove("active-step");

    const q = await getQuestion(i);
    if (userAnswers[i] === q.answer) {
      cp.classList.add("result-correct");
      cp.classList.remove("result-incorrect");
      cp.title = `Question ${i + 1}: Correct`;
    } else {
      cp.classList.add("result-incorrect");
      cp.classList.remove("result-correct");
      cp.title = `Question ${i + 1}: Incorrect`;
    }
  }
}

// ======================================================
// KEYBOARD NAVIGATION (LEFT / RIGHT ARROWS)
// ======================================================
window.addEventListener("keydown", (e) => {
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
    return;
  }
  if (e.key === "ArrowLeft") {
    goPrevious();
  } else if (e.key === "ArrowRight") {
    goNext();
  }
});

// ======================================================
// START APPLICATION (FETCH TOTAL COUNT FIRST)
// ======================================================
async function init() {
  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");

  try {
    if (loadingEl) loadingEl.hidden = false;
    if (errorEl) errorEl.hidden = true;

    // 1. Fetch the question count from "/api/questions/count"
    const response = await fetch("/api/questions/count");
    if (!response.ok) {
      throw new Error(`Failed to load question count (HTTP ${response.status})`);
    }

    // 2. Read JSON and set total
    const data = await response.json();
    total = data.count;

    if (total === 0) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent =
          "No questions found in the database. Please ensure seed_db.py has been executed.";
      }
      return;
    }

    // 3. Initialize highway stepper with the dynamic count
    initHighway();

    // 4. Render first question
    await renderQuestion();
  } catch (err) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = `Error initializing live quiz: ${err.message}`;
    }
  } finally {
    if (loadingEl) loadingEl.hidden = true;
  }
}

init();
