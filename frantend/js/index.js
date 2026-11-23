document.querySelector(".menu-toggle").addEventListener("click", () => {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const isMobile = window.matchMedia("(max-width: 767.98px)").matches;

  if (isMobile) {
    sidebar.classList.toggle("is-open");
  } else {
    sidebar.classList.toggle("is-collapsed");
    mainContent.classList.toggle("sidebar-collapsed");
  }
});
const totalStudent = document.getElementById("totalStudent");

async function loadStudents() {
  try {
    const response = await window.studentApi.getStudents();

    const students = Array.isArray(response) ? response : response?.data || [];

    totalStudent.textContent = students.length;
  } catch (error) {
    console.error("Error loading students:", error);
    totalStudent.textContent = "0";
  }
}

loadStudents();

const TotalEmployee = document.getElementById("totalEmployee");

async function loadEmployee() {
  try {
    const response = await window.employeeApi.getEmployees();
    const employees = Array.isArray(response) ? response : response?.data || [];
    totalEmployee.textContent = employees.length;
  } catch (error) {
    console.error("Error to load Employees count:", error);
  }
}
loadEmployee();
