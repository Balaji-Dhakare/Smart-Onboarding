(function () {
  const form = document.getElementById("employeeForm");
  const submitButton = form.querySelector(".btn-submit");

  const firstName = document.getElementById("firstName");
  const middleName = document.getElementById("middleName");
  const lastName = document.getElementById("lastName");
  const dob = document.getElementById("dob");
  const genderRadios = form.querySelectorAll('input[name="gender"]');
  const genderError = document.getElementById("genderError");
  const email = document.getElementById("email");
  const employeeId = document.getElementById("employeeId");
  const phone = document.getElementById("phone");
  const joiningDate = document.getElementById("joiningDate");
  const role = document.getElementById("role");
  const department = document.getElementById("department");
  const teacherFields = document.getElementById("teacherFields");
  const classCheckboxes = form.querySelectorAll('input[name="class_name"]');
  const divisionCheckboxes = form.querySelectorAll('input[name="division"]');
  const batchCheckboxes = form.querySelectorAll('input[name="batch"]');
  const subjectCheckboxes = form.querySelectorAll('input[name="subjects"]');
  const classError = document.getElementById("teacherClassError");
  const divisionError = document.getElementById("teacherDivisionError");
  const batchError = document.getElementById("teacherBatchError");
  const subjectError = document.getElementById("subjectError");
  const country = document.getElementById("country");
  const state = document.getElementById("state");
  const address = document.getElementById("address");
  const zip = document.getElementById("zip");

  const teacherSelectionGroups = [
    { inputs: classCheckboxes, error: classError },
    { inputs: divisionCheckboxes, error: divisionError },
    { inputs: batchCheckboxes, error: batchError },
    { inputs: subjectCheckboxes, error: subjectError },
  ];
  let isSubmitting = false;

  dob.max = window.validators.getTodayDateString();

  function clearSelectionError(inputs, error) {
    error.style.display = "none";
    inputs.forEach((input) => {
      input.classList.remove("is-invalid");
    });
  }

  function validateSelectionGroup(inputs, error) {
    const hasSelection = Array.from(inputs).some((input) => input.checked);

    error.style.display = hasSelection ? "none" : "block";
    inputs.forEach((input, index) => {
      input.classList.toggle("is-invalid", !hasSelection && index === 0);
    });

    return hasSelection;
  }

  function getSelectedValues(inputs) {
    return Array.from(inputs)
      .filter((input) => input.checked)
      .map((input) => input.value);
  }

  function updateTeacherFields() {
    const isTeachingDepartment = department.value === "Teaching";
    teacherFields.hidden = !isTeachingDepartment;

    if (!isTeachingDepartment) {
      teacherSelectionGroups.forEach(({ inputs, error }) => {
        clearSelectionError(inputs, error);
      });
    }
  }

  function validateEmployeeDOB() {
    if (!window.validators.validateRequired(dob, "Date of birth")) {
      return false;
    }

    if (dob.value > window.validators.getTodayDateString()) {
      window.validators.showError(dob, "Date of birth cannot be in the future.");
      return false;
    }

    const age = window.validators.calculateAge(dob.value);
    if (!Number.isFinite(age)) {
      window.validators.showError(dob, "Please enter a valid date of birth.");
      return false;
    }

    if (age <= 18) {
      window.validators.showError(dob, "Employee must be older than 18 years.");
      return false;
    }

    window.validators.showSuccess(dob);
    return true;
  }

  function validateGender() {
    const selectedGender = Array.from(genderRadios).find(
      (radio) => radio.checked
    );

    genderError.style.display = selectedGender ? "none" : "block";
    return Boolean(selectedGender);
  }

  function validateEmployeeId() {
    return window.validators.validatePattern(
      employeeId,
      /^[A-Za-z0-9 .'-]{1,50}$/,
      "Employee ID",
      "Please enter a valid Employee ID."
    );
  }

  function validateRole() {
    return window.validators.validatePattern(
      role,
      /^[A-Za-z][A-Za-z0-9 .'-]{0,49}$/,
      "Role",
      "Please enter a valid employee role."
    );
  }

  function validateAddress() {
    const value = address.value.trim();

    if (!value) {
      window.validators.clearError(address);
      return true;
    }

    if (!window.validators.validateMinLength(address, 5, "Address")) {
      return false;
    }

    if (value.length > 200) {
      window.validators.showError(address, "Address must be 200 characters or fewer.");
      return false;
    }

    window.validators.showSuccess(address);
    return true;
  }

  function validateTeacherFields() {
    if (department.value !== "Teaching") {
      teacherSelectionGroups.forEach(({ inputs, error }) => {
        clearSelectionError(inputs, error);
      });
      return true;
    }

    return teacherSelectionGroups
      .map(({ inputs, error }) => validateSelectionGroup(inputs, error))
      .every(Boolean);
  }

  function validateForm() {
    const results = [
      window.validators.validateName(firstName, "First name"),
      !middleName.value.trim() ||
        window.validators.validateName(middleName, "Middle name"),
      window.validators.validateName(lastName, "Last name"),
      validateEmployeeDOB(),
      validateGender(),
      window.validators.validateEmail(email),
      validateEmployeeId(),
      window.validators.validatePhone(phone, true),
      window.validators.validateRequired(joiningDate, "Joining date"),
      validateRole(),
      window.validators.validateSelect(department, "Department"),
      validateTeacherFields(),
      window.validators.validateSelect(country, "Country"),
      window.validators.validateSelect(state, "State"),
      window.validators.validateZip(zip),
      validateAddress(),
    ];

    return results.every(Boolean);
  }

  function buildEmployeePayload() {
    const selectedGender = form.querySelector('input[name="gender"]:checked');
    const payload = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      dob: dob.value,
      gender: selectedGender.value,
      phone: phone.value.trim(),
      empId: employeeId.value.trim(),
      joining_date: joiningDate.value,
      role: role.value.trim(),
      department: department.value,
      country: country.value,
      state: state.value,
      status: "Active",
    };

    if (middleName.value.trim()) {
      payload.middleName = middleName.value.trim();
    }

    if (address.value.trim()) {
      payload.address = address.value.trim();
    }

    if (zip.value.trim()) {
      payload.zip = zip.value.trim();
    }

    if (department.value === "Teaching") {
      payload.class_name = getSelectedValues(classCheckboxes).join(" ");
      payload.division = getSelectedValues(divisionCheckboxes).join(" ");
      payload.batch = getSelectedValues(batchCheckboxes).join(" ");
      payload.subjects = getSelectedValues(subjectCheckboxes).join(", ");
    }

    return payload;
  }

  function focusFirstError() {
    const firstInvalid = form.querySelector(".is-invalid");
    const target = firstInvalid || genderRadios[0];

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus();
  }

  function resetForm() {
    form.reset();
    updateTeacherFields();
    state.innerHTML = '<option value="" disabled selected>-- Select a State --</option>';
    state.disabled = true;

    form.querySelectorAll(".is-valid, .is-invalid").forEach((input) => {
      window.validators.clearError(input);
    });

    genderError.style.display = "none";
  }

  firstName.addEventListener("blur", () => {
    window.validators.validateName(firstName, "First name");
  });
  middleName.addEventListener("blur", () => {
    if (middleName.value.trim()) {
      window.validators.validateName(middleName, "Middle name");
    } else {
      window.validators.clearError(middleName);
    }
  });
  lastName.addEventListener("blur", () => {
    window.validators.validateName(lastName, "Last name");
  });
  dob.addEventListener("blur", () => {
    validateEmployeeDOB();
  });
  genderRadios.forEach((radio) => {
    radio.addEventListener("change", validateGender);
  });
  email.addEventListener("blur", () => {
    window.validators.validateEmail(email);
  });
  employeeId.addEventListener("blur", validateEmployeeId);
  phone.addEventListener("blur", () => {
    window.validators.validatePhone(phone, true);
  });
  joiningDate.addEventListener("blur", () => {
    window.validators.validateRequired(joiningDate, "Joining date");
  });
  role.addEventListener("blur", validateRole);
  department.addEventListener("blur", () => {
    window.validators.validateSelect(department, "Department");
  });
  department.addEventListener("change", updateTeacherFields);
  teacherSelectionGroups.forEach(({ inputs, error }) => {
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (department.value === "Teaching") {
          validateSelectionGroup(inputs, error);
        }
      });
    });
  });
  country.addEventListener("blur", () => {
    window.validators.validateSelect(country, "Country");
  });
  state.addEventListener("blur", () => {
    window.validators.validateSelect(state, "State");
  });
  address.addEventListener("blur", validateAddress);
  zip.addEventListener("blur", () => {
    window.validators.validateZip(zip);
  });

  updateTeacherFields();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      focusFirstError();
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      await window.employeeApi.submitEmployeeAdmission(buildEmployeePayload());
      window.alert("Employee registration submitted successfully.");
      resetForm();
    } catch (error) {
      console.error("Employee registration failed:", error);
      window.alert(
        `Could not submit the employee form. ${error.message || "Please try again."}`
      );
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Submit Form";
    }
  });
})();
