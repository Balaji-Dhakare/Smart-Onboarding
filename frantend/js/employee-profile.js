const profileElements = {
  message: document.getElementById("profileMessage"),
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

function getEmployeeName(employee) {
  return [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ") || "Employee profile";
}

function renderEmployee(employee) {
  const academics = employee.academics || {};
  const name = getEmployeeName(employee);
  const department = employee.department || "";
  const role = employee.role || "";
  const status = employee.status || "Active";
  const className = academics.class_name || academics.className || academics.class || "";
  const division = academics.division || "";
  const batch = academics.batch || "";
  const subjects = Array.isArray(academics.subjects)
    ? academics.subjects.join(", ")
    : academics.subjects || "";
  const hasTeachingDetails = [className, division, batch, subjects]
    .some((value) => String(value).trim());
  const initials = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .map((part) => part.trim().charAt(0))
    .join("")
    .toUpperCase();

  document.title = `${name} | Employee Profile | HMarkIT`;
  setProfileText("profileName", name);
  setProfileText("profileAcademic", [role, department].filter(Boolean).join(" · ") || "Employee");
  setProfileText("profileStatus", status);
  setProfileText("firstName", employee.firstName);
  setProfileText("middleName", employee.middleName);
  setProfileText("lastName", employee.lastName);
  setProfileText("email", employee.email);
  setProfileText("phone", employee.phone);
  setProfileText("gender", employee.gender);
  setProfileText("dob", formatDate(employee.dob));
  setProfileText("address", employee.address);
  setProfileText("country", employee.country);
  setProfileText("state", employee.state);
  setProfileText("zip", employee.zip);
  setProfileText("employeeId", employee.empId || employee.employeeId || employee.id);
  setProfileText("department", department);
  setProfileText("role", role);
  setProfileText("joiningDate", formatDate(employee.joining_date || employee.joiningDate));
  setProfileText(
    "academicClassName",
    className && !/^class\s/i.test(String(className))
      ? `Class ${className}`
      : className
  );
  setProfileText("academicDivision", division);
  setProfileText("academicBatch", batch);
  setProfileText("academicSubjects", subjects);

  document.getElementById("profileAvatar").textContent = initials || "EM";
  document.getElementById("employeeAcademicRows").hidden =
    !employee.isTeacher && !hasTeachingDetails;
  profileElements.status.classList.toggle(
    "is-inactive",
    String(status).toLowerCase() === "inactive"
  );
}

function showProfileMessage(message, isError) {
  profileElements.message.textContent = message;
  profileElements.message.classList.add("is-visible");
  profileElements.message.classList.toggle("is-error", isError);

  if (isError) {
    setProfileText("profileName", "Employee unavailable");
    setProfileText("profileAcademic", "Profile could not be loaded");
    setProfileText("profileStatus", "Unavailable");
    profileElements.status.classList.remove("is-inactive");
  }
}

async function loadEmployeeProfile() {
  const employeeId = new URLSearchParams(window.location.search).get("id");

  if (!employeeId) {
    showProfileMessage("No employee ID was provided. Open a profile from the employee directory.", true);
    return;
  }

  try {
    const employee = await window.employeeApi.getEmployee(employeeId);
    renderEmployee(employee);
    profileElements.message.classList.remove("is-visible", "is-error");
    profileElements.message.textContent = "";
  } catch (error) {
    showProfileMessage(error.message || "Unable to load this employee profile. Please try again.", true);
  }
}

loadEmployeeProfile();
