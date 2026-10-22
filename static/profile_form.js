// ======================================================
// SELECT ELEMENTS
// ======================================================
const form = document.getElementById("profile-form");
const stepper = document.querySelector(".form-stepper-roadmap");
const reviewPanel = document.getElementById("review-panel");
const editBtn = document.getElementById("edit-btn");
const confirmBtn = document.getElementById("confirm-btn");


// ======================================================
// HELPER: DISPLAY SINGLE VALUE
// ======================================================
function setReviewText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value && value.trim() !== "" ? value : "—";
  }
}


// ======================================================
// HELPER: DISPLAY MULTI-VALUE LIST
// ======================================================
function setReviewList(id, items) {
  const list = document.getElementById(id);
  if (!list) return;

  list.textContent = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "None selected";
    list.appendChild(li);
    return;
  }

  items.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}


// ======================================================
// POPULATE REVIEW PANEL FROM FORM DATA
// ======================================================
function populateReviewPanel() {
  // --------------------------------------------------
  // 1. PERSONAL INFORMATION
  // --------------------------------------------------
  setReviewText("review-student_id", document.getElementById("student_id").value);
  setReviewText("review-fullname", document.getElementById("fullname").value);
  setReviewText("review-email", document.getElementById("email").value);
  setReviewText("review-phone", document.getElementById("phone").value);
  setReviewText("review-birthdate", document.getElementById("birthdate").value);
  setReviewText("review-portfolio", document.getElementById("portfolio").value);
  setReviewText("review-gin446", document.getElementById("gin446").value);

  // --------------------------------------------------
  // 2. ACADEMIC INFORMATION
  // --------------------------------------------------
  setReviewText("review-major", document.getElementById("major").value);
  setReviewText("review-gpa", document.getElementById("gpa").value);
  setReviewText("review-credits", document.getElementById("credits").value);

  const graduation = document.querySelector('input[name="graduation"]:checked')?.value || "";
  setReviewText("review-graduation", graduation);

  setReviewText("review-graduation_month", document.getElementById("graduation_month").value);

  const internship = document.querySelector('input[name="internship_completed"]:checked')?.value || "";
  setReviewText("review-internship_completed", internship);

  // --------------------------------------------------
  // 3. TECHNICAL BACKGROUND (INCLUDING MULTI-VALUE FIELDS)
  // --------------------------------------------------
  const skills = [...document.querySelectorAll('input[name="skills"]:checked')]
    .map(cb => cb.value);
  setReviewList("review-skills", skills);

  setReviewText("review-language", document.getElementById("language").value);

  const software = [...document.getElementById("software").selectedOptions]
    .map(opt => opt.value);
  setReviewList("review-software", software);

  // --------------------------------------------------
  // 4. FINAL YEAR PROJECT
  // --------------------------------------------------
  setReviewText("review-project_title", document.getElementById("project_title").value);
  setReviewText("review-description", document.getElementById("description").value);
  setReviewText("review-project_area", document.getElementById("project_area").value);
  setReviewText("review-team_size", document.getElementById("team_size").value);
  setReviewText("review-project_color", document.getElementById("project_color").value);
  setReviewText("review-meeting_date", document.getElementById("meeting_date").value);
  setReviewText("review-meeting_time", document.getElementById("meeting_time").value);

  // --------------------------------------------------
  // 5. CONFIRMATION
  // --------------------------------------------------
  const confirmed = document.getElementById("confirmation").checked ? "Confirmed" : "Not confirmed";
  setReviewText("review-confirmation", confirmed);
}


// ======================================================
// INTERCEPT FORM SUBMISSION & VALIDATE
// ======================================================
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  populateReviewPanel();
  form.classList.add("hidden");
  if (stepper) {
    stepper.classList.add("hidden");
  }
  reviewPanel.classList.add("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
});


// ======================================================
// EDIT BUTTON: RETURN TO FORM WITH DATA INTACT
// ======================================================
editBtn.addEventListener("click", function () {
  reviewPanel.classList.remove("open");
  form.classList.remove("hidden");
  if (stepper) {
    stepper.classList.remove("hidden");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
});


// ======================================================
// CONFIRM & SUBMIT BUTTON: SEND TO SERVER
// ======================================================
confirmBtn.addEventListener("click", function () {
  form.submit();
});
