const state = { students: [] };

const elements = {
  grid: document.getElementById("studentGrid"),
  search: document.getElementById("studentSearch"),
  classFilter: document.getElementById("classFilter"),
  batchFilter: document.getElementById("batchFilter"),
  genderFilter: document.getElementById("genderFilter"),
  resultCount: document.getElementById("resultCount"),
  total: document.getElementById("totalStudents"),
};

function getValue(student, ...keys) {
  for (const key of keys) {
    if (student && student[key] !== undefined && student[key] !== null) {
      return student[key];
    }
  }
  return "";
}

function normalizeStudents(response) {
  const records = Array.isArray(response) ? response : response?.data || [];
  return records.map((record) => ({
    ...record,
    academics: record.academics || {},
  }));
}

function fullName(student) {
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ") || "Unnamed student";
}

function matches(student) {
  const academics = student.academics;
  const search = elements.search.value.trim().toLowerCase();
  const name = fullName(student).toLowerCase();
  const email = String(getValue(student, "email")).toLowerCase();
  const className = String(
    getValue(student, "class_name", "className") ||
    getValue(academics, "class_name", "className")
  );
  const batch = String(
    getValue(student, "batch") ||
    getValue(academics, "batch")
  );
  const gender = String(getValue(student, "gender"));

  return (
    (!search || name.includes(search) || email.includes(search)) &&
    (!elements.classFilter.value ||
      className === elements.classFilter.value ||
      className === `Class ${elements.classFilter.value}`) &&
    (!elements.batchFilter.value ||
      batch.toLowerCase() === elements.batchFilter.value.toLowerCase()) &&
    (!elements.genderFilter.value ||
      gender.toLowerCase() === elements.genderFilter.value.toLowerCase())
  );
}

function render() {
  const filtered = state.students.filter(matches);

  elements.resultCount.textContent =
    `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;

  elements.grid.innerHTML = filtered.length
    ? `<div class="table-scroll">
        <table class="student-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Class</th>
              <th>Division</th>
              <th>Batch</th>
              <th>Gender</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((student) => {
              const academics = student.academics;
              const className =
                getValue(student, "class_name", "className") ||
                getValue(academics, "class_name", "className") ||
                "-";

              const batch =
                getValue(student, "batch") ||
                getValue(academics, "batch") ||
                "-";

              const division =
                getValue(student, "division") ||
                getValue(academics, "division") ||
                "-";

              const gender =
                getValue(student, "gender") || "-";

              const name = fullName(student);

              const status =
                getValue(student, "status") || "Active";

              return `
                <tr>
                  <td>
                    <strong>
                      <span class="table-avatar">${getValue(student, "id")}</span>
                      ${name}
                    </strong>
                  </td>
                  <td>${getValue(student, "email") || "-"}</td>
                  <td>${className}</td>
                  <td>${division}</td>
                  <td>${batch}</td>
                  <td>${gender}</td>
                  <td>
                    <span class="status-badge">${status}</span>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>`
    : `<div class="empty-state">
        No students match the selected filters.
      </div>`;
}
console.log("studentApi:", window.studentApi);
async function loadStudents() {
  try {
    const response = await window.studentApi.getStudents();

    state.students = normalizeStudents(response);

    elements.total.textContent = state.students.length;

    render();
  } catch (error) {
    elements.grid.innerHTML = `
      <div class="error-state">
        Could not load students. Please make sure the backend is running.
      </div>
    `;
  }
}

document.getElementById("applyFilters").addEventListener("click", render);

document.getElementById("clearFilters").addEventListener("click", () => {
  elements.search.value = "";
  elements.classFilter.value = "";
  elements.batchFilter.value = "";
  elements.genderFilter.value = "";
  render();
});

loadStudents();