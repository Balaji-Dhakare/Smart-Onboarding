


// ======================================================
// GET HTML ELEMENTS
// ======================================================

const {
  clearError,
  showError,
  showSuccess,
  validateEmail,
  validateName,
  validatePhone,
  validateSelect,
  validateZip,
} = window.validators;

const country = document.getElementById("country");
const state = document.getElementById("state");

const form = document.getElementById("admissionForm");
const submitBtn = document.querySelector(".btn-submit");

const firstName = document.getElementById("firstName");
const middleName = document.getElementById("middleName");
const lastName = document.getElementById("lastName");

const dob = document.getElementById("dob");
const gender = document.getElementById("gender");
const email = document.getElementById("email");

const phone = document.getElementById("phone");
const guardianPhone = document.getElementById("guardianPhone");

const studentClass = document.getElementById("class");
const division = document.getElementById("division");
const batch = document.getElementById("batch");

const zip = document.getElementById("zip");
const address = document.getElementById("address");

const subjects = document.querySelectorAll(
  'input[name="subjects"]'
);
const subjectError = document.getElementById("subjectError");

const genderRadios = document.querySelectorAll(
  'input[name="gender"]'
);
const subjectCheckboxes = document.querySelectorAll(
  'input[name="subjects"]'
);

let isSubmitting = false;

// ======================================================
//    Validete in Run Time 
// ======================================================


firstName.addEventListener("blur", () => {
  validateName(firstName, "First name");
});

middleName.addEventListener("blur", () => {
  if (middleName.value.trim() !== "") {
    validateName(middleName, "Middle name");
  } else {
    clearError(middleName);
  }
});

lastName.addEventListener("blur", () => {
  validateName(lastName, "Last name");
});

email.addEventListener("blur", () => {
    validateEmail(email);
});

phone.addEventListener("blur", () => {
  validatePhone(phone, true);
});

dob.addEventListener("blur", () => {
    validateDOB(dob);
});

country.addEventListener("blur", () => {
    validateSelect(country, "Country");
});

state.addEventListener("blur", () => {
    validateSelect(state, "State");
});

studentClass.addEventListener("blur", () => {
    validateSelect(studentClass, "Class");
});

division.addEventListener("blur", () => {
    validateSelect(division, "Division");
});

batch.addEventListener("blur", () => {
    validateSelect(batch, "Preferred Batch");
});

zip.addEventListener("blur", () => {
    validateZip(zip);
});


genderRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        validateGender(gender);
    });
});

subjectCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        validateSubjects();
    });
});



// ======================================================
// SET MAXIMUM DOB TO TODAY
// ======================================================

dob.max = window.validators.getTodayDateString();





// ======================================================
// DOB VALIDATION
// ======================================================

function validateDOB() {

  const value = dob.value;

  if (value === "") {

    showError(
      dob,
      "Date of birth is required."
    );

    return false;

  }

  const today = window.validators.getTodayDateString();
  if (value > today) {

    showError(
      dob,
      "Date of birth cannot be in the future."
    );

    return false;

  }

  const age = window.validators.calculateAge(value);

  if (!Number.isFinite(age)) {
    showError(dob, "Please enter a valid date of birth.");
    return false;
  }

  if (age <= 5) {
    showError(
      dob,
      "Student must be older than 5 years."
    );
    return false;
  }

  if (age >= 20) {
    showError(
      dob,
      "Student must be younger than 20 years."
    );
    return false;
  }

  showSuccess(dob);

  return true;

}



// ======================================================
// GENDER VALIDATION
// ======================================================

function validateGender(input) {

  const genderError = document.getElementById("genderError");
  const selectedGender = Array.from(genderRadios).find(radio => radio.checked);

  if (!selectedGender) {
    genderError.style.display = "block";
    return false;
  }

  genderError.style.display = "none";
  return true;

}

function normalizeGender(value) {
  const map = {
    male: "Male",
    female: "Female",
    other: "Other",
    "Prefer not to say": "Prefer not to say"
  };

  return map[String(value).trim().toLowerCase()] || value;
}

function buildStudentPayload() {
  const selectedGender = document.querySelector('input[name="gender"]:checked');
  const selectedSubjects = Array.from(subjectCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value)
    .join(", ");

  const payload = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
    dob: dob.value,
    gender: normalizeGender(selectedGender?.value || ""),
    phone: phone.value.trim(),
    country: country.value,
    state: state.value,
    class_name: studentClass.value,
    division: division.value,
    subjects: selectedSubjects,
    batch: batch.value,
    status: "Active"
  };

  if (middleName.value.trim()) {
    payload.middleName = middleName.value.trim();
  }

  if (address.value.trim()) {
    payload.address = address.value.trim();
  }

  if (guardianPhone.value.trim()) {
    payload.guardianPhone = guardianPhone.value.trim();
  }

  if (zip.value.trim()) {
    payload.zip = zip.value.trim();
  }

  return payload;
}


// ======================================================
// SUBJECTS VALIDATION
// ======================================================

function validateSubjects() {

  const selectedSubjects = Array.from(subjectCheckboxes).filter(checkbox => checkbox.checked);

  if (selectedSubjects.length === 0) {
    subjectError.style.display = "block";
    return false;
  }

  subjectError.style.display = "none";
  return true;

}


// ======================================================
// FORM SUBMISSION
// ======================================================

form.addEventListener("submit", function (event) {

  event.preventDefault();

  let isValid = true;


  // ====================================================
  // NAME VALIDATION
  // ====================================================

  if (!validateName(firstName, "First name")) {
    isValid = false;
  }


  if (middleName.value.trim() !== "") {

    if (!validateName(middleName, "Middle name")) {
      isValid = false;
    }

  }


  if (!validateName(lastName, "Last name")) {
    isValid = false;
  }


  // ====================================================
  // DOB
  // ====================================================

  if (!validateDOB()) {
    isValid = false;
  }


  // ====================================================
  // GENDER
  // ====================================================

  if (!validateGender(gender)) {
    isValid = false;
  }


  // ====================================================
  // EMAIL
  // ====================================================

  if (!validateEmail(email)) {
    isValid = false;
  }


  // ====================================================
  // PHONE
  // ====================================================

  if (!validatePhone(phone, true)) {
    isValid = false;
  }


  if (!validatePhone(guardianPhone, false)) {
    isValid = false;
  }


  // ====================================================
  // ACADEMIC DETAILS
  // ====================================================

  if (!validateSelect(studentClass, "Class")) {
    isValid = false;
  }


  if (!validateSelect(division, "Division")) {
    isValid = false;
  }


  if (!validateSelect(batch, "Preferred Batch")) {
    isValid = false;
  }

  // ====================================================
  // SUBJECTS
  // ====================================================

  if (!validateSubjects()) {
    isValid = false;
  }


  // ====================================================
  // LOCATION
  // ====================================================

  if (!validateSelect(country, "Country")) {
    isValid = false;
  }


  if (!validateSelect(state, "State")) {
    isValid = false;
  }


  // ====================================================
  // ZIP
  // ====================================================

  if (!validateZip(zip)) {
    isValid = false;
  }


  // ====================================================
  // SUCCESS
  // ====================================================

  if (isValid) {

    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Submitting...";

    const payload = buildStudentPayload();
    const selectedSubjects = Array.from(subjectCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value)
      .join(", ");

    window.studentApi.submitStudentAdmission(payload)
    .then(function () {
      return window.emailService.sendAdmissionEmail({
        firstName: firstName.value,
        middleName: middleName.value || "",
        lastName: lastName.value,
        dob: dob.value,
        gender: normalizeGender(document.querySelector('input[name="gender"]:checked')?.value || ""),
        email: email.value,
        phone: phone.value,
        guardianPhone: guardianPhone.value || "",
        class: studentClass.value,
        division: division.value,
        batch: batch.value,
        subjects: selectedSubjects,
        address: address.value || "",
        country: country.value,
        state: state.value,
        zip: zip.value || ""
      });
        })
    .then(function (response) {

      console.log("Email sent successfully:", response);

      alert("Student admission form submitted successfully!\n\nWe've received your application and will contact you soon.");

      form.reset();

      // Reset state dropdown
      state.innerHTML = '<option value="" disabled selected>-- Select a State --</option>';
      state.disabled = true;

      // Remove validation styles
      const inputs = form.querySelectorAll(".is-valid, .is-invalid");
      inputs.forEach(function (input) {
        input.classList.remove("is-valid", "is-invalid");
      });

      // Hide all error messages
      const errorMessages = form.querySelectorAll(".invalid-feedback");
      errorMessages.forEach(msg => {
        if (msg.id !== "subjectError" && msg.id !== "genderError") {
          msg.style.display = "none";
        }
      });

      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit Form";

    }).catch(function (error) {

      console.error("Email sending error:", error);

      alert("Failed to submit form. Please check your internet connection and try again.");

      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit Form";

    });

  }


  // ====================================================
  // ERROR
  // ====================================================

  else {

    const firstError =
      form.querySelector(".is-invalid");


    if (firstError) {

      firstError.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      firstError.focus();

    }

  }

});