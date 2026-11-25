const profileElements = {
  message: document.getElementById("profileMessage"),
  subjectList: document.getElementById("subjectList"),
  status: document.getElementById("profileStatus"),
};

function setProfileText(id, value) {
  const element = document.getElementById(id);
  element.textContent = value === undefined || value === null || value === ""
    ? "—"
    : String(value);
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
}

function getStudentName(student) {
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ") || "Student profile";
}

function formatClassName(value) {
  const className = String(value || "").trim();
  if (!className) {
    return "";
  }

  return /^class\s/i.test(className) ? className : `Class ${className}`;
}

function renderSubjects(subjects) {
  profileElements.subjectList.replaceChildren();

  const subjectNames = Array.isArray(subjects)
    ? subjects
    : String(subjects || "").split(",");
  const cleanedSubjects = subjectNames.map((subject) => String(subject).trim()).filter(Boolean);

  if (cleanedSubjects.length === 0) {
    const emptyState = document.createElement("span");
    emptyState.className = "empty-subjects";
    emptyState.textContent = "No subjects listed";
    profileElements.subjectList.appendChild(emptyState);
    return;
  }

  cleanedSubjects.forEach((subject) => {
    const chip = document.createElement("span");
    chip.className = "subject-chip";
    chip.textContent = subject;
    profileElements.subjectList.appendChild(chip);
  });
}

function renderStudent(student) {
  const academics = student.academics || {};
  const name = getStudentName(student);
  const className = student.class_name || student.className || academics.class_name || academics.className || academics.class || "";
  const formattedClassName = formatClassName(className);
  const division = student.division || academics.division || "";
  const batch = student.batch || academics.batch || "";
  const status = student.status || "Active";
  const statusIsInactive = String(status).toLowerCase() === "inactive";
  const initials = [student.firstName, student.lastName]
    .filter(Boolean)
    .map((part) => part.trim().charAt(0))
    .join("")
    .toUpperCase();

  document.title = `${name} | Student Profile | HMarkIT`;
  setProfileText("profileName", name);
  setProfileText("profileAcademic", formattedClassName ? `${formattedClassName}${division ? ` · Division ${division}` : ""}` : "Student");
  setProfileText("profileStatus", status);
  setProfileText("firstName", student.firstName);
  setProfileText("middleName", student.middleName);
  setProfileText("lastName", student.lastName);
  setProfileText("email", student.email);
  setProfileText("phone", student.phone);
  setProfileText("guardianPhone", student.guardianPhone);
  setProfileText("gender", student.gender);
  setProfileText("dob", formatDate(student.dob));
  setProfileText("address", student.address);
  setProfileText("country", student.country);
  setProfileText("state", student.state);
  setProfileText("zip", student.zip);
  setProfileText("className", formattedClassName);
  setProfileText("division", division);
  setProfileText("batch", batch);

  document.getElementById("profileAvatar").textContent = initials || "ST";
  profileElements.status.classList.toggle("is-inactive", statusIsInactive);
  renderSubjects(student.subjects || academics.subjects);
}

function showProfileMessage(message, isError) {
  profileElements.message.textContent = message;
  profileElements.message.classList.add("is-visible");
  profileElements.message.classList.toggle("is-error", isError);

  if (isError) {
    setProfileText("profileName", "Student unavailable");
    setProfileText("profileAcademic", "Profile could not be loaded");
    setProfileText("profileStatus", "Unavailable");
    profileElements.status.classList.remove("is-inactive");
  }
}

async function loadStudentProfile() {
  const studentId = new URLSearchParams(window.location.search).get("id");

  if (!studentId) {
    showProfileMessage("No student ID was provided. Open a profile from the student directory.", true);
    return;
  }

  try {
    const student = await window.studentApi.getStudent(studentId);
    renderStudent(student);
    profileElements.message.classList.remove("is-visible", "is-error");
    profileElements.message.textContent = "";
  } catch (error) {
    showProfileMessage(error.message || "Unable to load this student profile. Please try again.", true);
  }
}

loadStudentProfile();
