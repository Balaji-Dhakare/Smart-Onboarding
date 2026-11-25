const state = { employees: [] };

const elements = {
  grid: document.getElementById("employeeGrid"),
  search: document.getElementById("employeeSearch"),
  departmentFilter: document.getElementById("departmentFilter"),
  roleFilter: document.getElementById("roleFilter"),
  genderFilter: document.getElementById("genderFilter"),
  resultCount: document.getElementById("resultCount"),
  total: document.getElementById("totalEmployees"),
};

function getValue(employee, ...keys) {
  for (const key of keys) {
    if (employee && employee[key] !== undefined && employee[key] !== null) {
      return employee[key];
    }
  }
  return "";
}

function normalizeEmployees(response) {
  const records = Array.isArray(response) ? response : response?.data || [];
  return records.map((record) => ({
    ...record,
  }));
}

function fullName(employee) {
  return [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ") || "Unnamed employee";
}

function matches(employee) {
  const search = elements.search.value.trim().toLowerCase();
  const name = fullName(employee).toLowerCase();
  const email = String(getValue(employee, "email")).toLowerCase();
  const department = String(getValue(employee, "department")).toLowerCase();
  const role = String(getValue(employee, "role")).toLowerCase();
  const gender = String(getValue(employee, "gender")).toLowerCase();

  const roleQuery = elements.roleFilter.value.trim().toLowerCase();

  return (
    (!search || name.includes(search) || email.includes(search)) &&
    (!elements.departmentFilter.value ||
      department === elements.departmentFilter.value.toLowerCase()) &&
    (!roleQuery || role.includes(roleQuery)) &&
    (!elements.genderFilter.value ||
      gender === elements.genderFilter.value.toLowerCase())
  );
}

function render() {
  const filtered = state.employees.filter(matches);

  elements.resultCount.textContent =
    `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;

  elements.grid.innerHTML = filtered.length
    ? `<div class="table-scroll">
        <table class="student-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Department</th>
              <th>Role</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((emp) => {
              const empId = getValue(emp, "empId", "employeeId", "id") || "EMP";
              const email = getValue(emp, "email") || "-";
              const contact = getValue(emp, "phone", "employeeContact") || "-";
              const department = getValue(emp, "department") || "-";
              const role = getValue(emp, "role") || "-";
              const joiningDate = getValue(emp, "joining_date", "joiningDate") || "-";
              const gender = getValue(emp, "gender") || "-";
              const name = fullName(emp);
              const status = getValue(emp, "status") || "Active";
              const employeeDatabaseId = getValue(emp, "id");

              return `
                <tr>
                  <td>
                    <strong>
                      <span class="table-avatar">${empId.slice(-3)}</span>
                      ${name}
                    </strong>
                  </td>
                  <td>${empId}</td>
                  <td>${email}</td>
                  <td>+91 ${contact}</td>
                  <td>${department}</td>
                  <td>${role}</td>
                  <td>${joiningDate}</td>
                  <td>
                    <span class="status-badge">${status}</span>
                  </td>
                  <td>
                    <button class="student-profile-button" type="button" data-profile-url="./employeeprofile.html?id=${encodeURIComponent(employeeDatabaseId)}">View profile</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>`
    : `<div class="empty-state">
        No employees match the selected filters.
      </div>`;
}

async function loadEmployees() {
  try {
    const response = await window.employeeApi.getEmployees();

    state.employees = normalizeEmployees(response);
    elements.total.textContent = state.employees.length;
    render();
  } catch (error) {
    elements.grid.innerHTML = `
      <div class="error-state">
        Could not load employees. Please check your employee API connection.
      </div>
    `;
  }
}

document.getElementById("applyFilters").addEventListener("click", render);

document.getElementById("clearFilters").addEventListener("click", () => {
  elements.search.value = "";
  elements.departmentFilter.value = "";
  elements.roleFilter.value = "";
  elements.genderFilter.value = "";
  render();
});

elements.grid.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest(".student-profile-button");
  if (button) {
    window.location.assign(button.dataset.profileUrl);
  }
});

loadEmployees();