// ======================================================
// QUESTIONS
// ======================================================
const questions = [
  {
    question: "Which keyword declares a block-scoped variable that can later be reassigned?",
    choices: ["var", "let", "const", "static"],
    answer: 1,
    explanation: "let declares a block-scoped variable whose value may later be reassigned."
  },
  {
    question: "Which JavaScript operator tests strict equality?",
    choices: ["=", "==", "===", "!="],
    answer: 2,
    explanation: "The === operator compares both value and type."
  },

  {
    question: "Which property gives the number of elements in a JavaScript array?",
    choices: ["count", "length", "size", "index"],
    answer: 1,

    explanation: "The length property returns the number of elements in an array."
  },
  {
    question: "Which method adds one or more elements to the end of an array?",
    choices: ["push()", "pop()", "shift()", "unshift()"],
    answer: 0,
    explanation: "The push() method adds elements to the end of an array and returns the new length."
  },

  {
    question: "What does the typeof operator return for the value 'Hello, World!'?",
    choices: ["number", "boolean", "string", "object"],
    answer: 2,
    explanation: "Text enclosed in single or double quotes has the primitive type 'string'."
  },
  {
    question: "What happens when you attempt to reassign a variable declared with const?",
    choices: [
      "The variable is successfully reassigned",
      "A TypeError is thrown",
      "The variable automatically converts to var",
      "The assignment is silently ignored"
    ],
    answer: 1,
    explanation: "Variables declared with const cannot be reassigned; attempting to do so throws a TypeError."
  },

  {
    question: "How do you access the value of property 'age' in the object person = { age: 21 }?",
    choices: ["person.age", "person->age", "person::age", "person(age)"],
    answer: 0,
    explanation: "In JavaScript, object properties are accessed using dot notation (person.age) or bracket notation (person['age'])."
  },
  {
    question: "Which loop is guaranteed to execute its code block at least once before testing the condition?",
    choices: ["for loop", "while loop", "do...while loop", "for...in loop"],
    answer: 2,

    explanation: "A do...while loop evaluates its condition after executing the code block, ensuring at least one execution."
  },

  {
    question: "Which statement is used to exit a function and specify the value to pass back to the caller?",
    choices: ["return", "break", "exit", "continue"],
    answer: 0,
    explanation: "The return statement ends function execution and specifies a value to be returned."
  },
  {
    question: "Which operator returns its right-hand operand when its left-hand operand is null or undefined?",
    choices: ["??", "||", "&&", "?:"],
    answer: 0,
    explanation: "The nullish coalescing operator (??) returns its right-hand operand when its left-hand operand is null or undefined."
  }
];


// ======================================================
// APPLICATION STATE
// ======================================================
let currentQuestion = 0;
const userAnswers = new Array(questions.length);



// ======================================================
function saveAnswer(choiceIndex) {
  //   Save the user's answer for the current question.
  userAnswers[currentQuestion] = choiceIndex;
  updateHighway();
}

function jumpToQuestion(index) {
  // Jump directly to a question from the timeline highway.
  if (index >= 0 && index < questions.length) {
    currentQuestion = index;
    renderQuestion();
  }
}



// ======================================================
// NAVIGATION
// ======================================================
function goNext() {
  //   Move to the next question if not at the last question.
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;

    renderQuestion();
  }
}


function goPrevious() {
  //   Move to the previous question if not at the first question.
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }

}


function goFirst() {
  //   Move to the first question.
  currentQuestion = 0;
  renderQuestion();
}


function goLast() {
  //   Move to the last question.
  currentQuestion = questions.length - 1;

  renderQuestion();
}



// ======================================================
// CALCULATE SCORE
// ======================================================
function calculateScore() {
  //   Calculate the user's score based on their answers.
  let score = 0;

  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] === questions[i].answer) {
      score++;
    }
  }

  return score;
}



// ======================================================
// CALCULATE PERCENTAGE
// ======================================================
function calculatePercentage(score) {
  //   Calculate the percentage score based on the total number of questions.
  if (questions.length === 0) {
    return 0;
  }

  let percentage = (score / questions.length) * 100;
  return Math.round(percentage);

}



// ======================================================
// PERFORMANCE MESSAGE
// ======================================================
function getPerformanceMessage(percentage) {
  //   Return a performance message based on the percentage score.
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
// BUILD CORRECTION
// ======================================================
function buildCorrection() {
  let correction = "";

  //   Build a correction string that includes the question, the user's answer,
  //   the correct answer, and an explanation for each question.
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    let userAnswer = "Not answered";

    if (userAnswers[i] !== undefined) {
      userAnswer = q.choices[userAnswers[i]];
    }

    let correctAnswer = q.choices[q.answer];

    let result = "Incorrect";
    if (userAnswers[i] === q.answer) {
      result = "Correct";
    }

    correction += `Question ${i + 1}: ${q.question}\n\n`;
    correction += `Your answer: ${userAnswer}\n`;
    correction += `Correct answer: ${correctAnswer}\n`;
    correction += `Result: ${result}\n`;
    correction += `Explanation: ${q.explanation}\n`;

    if (i < questions.length - 1) {
      correction += "\n--------------------------------------------------\n\n";
    }
  }

  return correction;
}


// ======================================================
// PROVIDED INTERFACE CODE
//
// DOM manipulation and events will be studied later.
// ======================================================

// ======================================================
// SUBMIT QUIZ
// ======================================================
function submitQuiz() {
  const score = calculateScore();
  const percentage = calculatePercentage(score);
  const message = getPerformanceMessage(percentage);
  const correction = buildCorrection();
  showResults(score, percentage, message, correction);
}

function renderQuestion() {
  const q = questions[currentQuestion];

  // --------------------------------------------------
  // QUESTION NUMBER
  // --------------------------------------------------
  document.getElementById("progress").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  // --------------------------------------------------
  // QUESTION
  // --------------------------------------------------
  document.getElementById("questionText").textContent = q.question;

  // --------------------------------------------------
  // CHOICES
  // --------------------------------------------------
  const choicesContainer = document.getElementById("choices");
  choicesContainer.innerHTML = "";
  for (let i = 0; i < q.choices.length; i++) {
    const label = document.createElement("label");
    label.className = "choice";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = i;
    // Restore an answer previously selected
    // by the user.
    if (userAnswers[currentQuestion] === i) {
      radio.checked = true;
    }
    // When the user selects this answer,
    // save its index.
    radio.onclick = function () {
      saveAnswer(i);
    };
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + q.choices[i]));
    choicesContainer.appendChild(label);
  }

  // --------------------------------------------------
  // NAVIGATION BUTTONS
  // --------------------------------------------------
  document.getElementById("firstBtn").disabled = currentQuestion === 0;
  document.getElementById("previousBtn").disabled = currentQuestion === 0;
  document.getElementById("nextBtn").disabled =
    currentQuestion === questions.length - 1;
  document.getElementById("lastBtn").disabled =
    currentQuestion === questions.length - 1;

  // --------------------------------------------------
  // UPDATE TIMELINE HIGHWAY
  // --------------------------------------------------
  updateHighway();
}

// ======================================================
// TIMELINE ROADWAY / HIGHWAY
// ======================================================
function initHighway() {
  const highway = document.getElementById("questionHighway");
  if (!highway) return;
  highway.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
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
  for (let i = 0; i < questions.length; i++) {
    const cp = document.getElementById(`checkpoint-${i}`);
    if (!cp) continue;
    if (i === currentQuestion) {
      cp.classList.add("active-step");
      cp.setAttribute("aria-selected", "true");
    } else {
      cp.classList.remove("active-step");
      cp.setAttribute("aria-selected", "false");
    }
    if (userAnswers[i] !== undefined) {
      cp.classList.add("answered");
    } else {
      cp.classList.remove("answered");
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
// DISPLAY RESULTS
// ======================================================
function showResults(score, percentage, message, correction) {
  document.getElementById("quizPanel").style.display = "none";
  document.getElementById("resultsPanel").style.display = "block";
  document.getElementById("scoreText").textContent =
    `Score: ${score} / ${questions.length}`;
  document.getElementById("percentageText").textContent =
    `Percentage: ${percentage}%`;
  document.getElementById("performanceText").textContent = message;
  document.getElementById("correction").textContent = correction;

  // Update highway stations with test results (Green for correct, Red for incorrect)
  for (let i = 0; i < questions.length; i++) {
    const cp = document.getElementById(`checkpoint-${i}`);
    if (!cp) continue;
    cp.classList.remove("active-step");
    if (userAnswers[i] === questions[i].answer) {
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
// START APPLICATION
// ======================================================
initHighway();
renderQuestion();
