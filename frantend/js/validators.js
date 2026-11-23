(function () {
  const NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  const EMAIL_PATTERN = /^[A-Za-z][^\s@]*@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^[6-9][0-9]{9}$/;
  const ZIP_PATTERN = /^[0-9]{6}$/;

  function getTodayDateString() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${today.getFullYear()}-${month}-${day}`;
  }

  function calculateAge(dateOfBirth, today = new Date()) {
    const [year, month, day] = dateOfBirth.split("-").map(Number);

    if (![year, month, day].every(Number.isFinite)) {
      return NaN;
    }

    let age = today.getFullYear() - year;
    if (
      today.getMonth() + 1 < month ||
      (today.getMonth() + 1 === month && today.getDate() < day)
    ) {
      age--;
    }

    return age;
  }

  function showError(input, message) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");

    const parent = input.parentElement;
    const feedback =
      parent.querySelector(".invalid-feedback") ||
      parent.parentElement?.querySelector(".invalid-feedback");

    if (feedback) {
      feedback.textContent = message;
    }
  }

  function showSuccess(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  function clearError(input) {
    input.classList.remove("is-invalid", "is-valid");
  }

  function validateRequired(input, fieldName) {
    if (!input.value.trim()) {
      showError(input, `${fieldName} is required.`);
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateMinLength(input, min, fieldName) {
    if (input.value.trim().length < min) {
      showError(
        input,
        `${fieldName} must contain at least ${min} characters.`
      );
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateName(input, fieldName) {
    if (!validateRequired(input, fieldName)) {
      return false;
    }

    if (!validateMinLength(input, 2, fieldName)) {
      return false;
    }

    if (!NAME_PATTERN.test(input.value.trim())) {
      showError(input, `${fieldName} should contain letters only.`);
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateEmail(input) {
    if (!validateRequired(input, "Email")) {
      return false;
    }

    if (!EMAIL_PATTERN.test(input.value.trim())) {
      showError(input, "Please enter a valid email address.");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validatePhone(input, required = false) {
    const value = input.value.trim();

    if (!value && !required) {
      clearError(input);
      return true;
    }

    if (!validateRequired(input, "Mobile number")) {
      return false;
    }

    if (!PHONE_PATTERN.test(value)) {
      showError(input, "Enter a valid 10-digit mobile number.");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validatePattern(input, pattern, fieldName, message) {
    if (!validateRequired(input, fieldName)) {
      return false;
    }

    if (!pattern.test(input.value.trim())) {
      showError(input, message);
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateSelect(input, fieldName) {
    return validateRequired(input, fieldName);
  }

  function validateZip(input) {
    const value = input.value.trim();

    if (!value) {
      clearError(input);
      return true;
    }

    if (!ZIP_PATTERN.test(value)) {
      showError(input, "PIN code must contain exactly 6 digits.");
      return false;
    }

    showSuccess(input);
    return true;
  }

  window.validators = {
    calculateAge,
    clearError,
    getTodayDateString,
    showError,
    showSuccess,
    validateEmail,
    validateMinLength,
    validateName,
    validatePattern,
    validatePhone,
    validateRequired,
    validateSelect,
    validateZip,
  };
})();
