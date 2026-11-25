(function () {
  const API_BASE_URL = "http://127.0.0.1:8000";
  const DEFAULT_EMPLOYEE_ENDPOINT = "/employees/";
  const DEPARTMENT_EMPLOYEE_ENDPOINTS = {
    Teaching: "/employees/teachers",
  };

  async function submitEmployeeAdmission(payload) {
    const endpoint =
      DEPARTMENT_EMPLOYEE_ENDPOINTS[payload.department] ||
      DEFAULT_EMPLOYEE_ENDPOINT;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Employee API request failed with status ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = Array.isArray(errorData.detail)
            ? errorData.detail.map(item => item.msg).join(" | ")
            : errorData.detail;
        }
      } catch (error) {
        // ignore parsing error and keep fallback message
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

    async function getEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Employees: ${response.status}`);
    }

    return response.json();
  }

  async function getEmployee(id) {
    const query = `?id=${encodeURIComponent(id)}`;
    const response = await fetch(`${API_BASE_URL}/employees/${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.status}`);
    }

    const result = await response.json();
    const employee = result.data?.[0];

    if (!employee) {
      throw new Error("Employee not found.");
    }

    if (String(employee.department).trim().toLowerCase() !== "teaching") {
      return employee;
    }

    const teacherResponse = await fetch(
      `${API_BASE_URL}/employees/teachers/${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!teacherResponse.ok) {
      throw new Error(`Failed to fetch teaching details: ${teacherResponse.status}`);
    }

    const teacherResult = await teacherResponse.json();
    const teacher = teacherResult.data?.[0];

    return {
      ...employee,
      isTeacher: true,
      academics: teacher?.academics || null,
    };
  }

  window.employeeApi = {
    submitEmployeeAdmission,
    getEmployees,
    getEmployee,
  };
})();
