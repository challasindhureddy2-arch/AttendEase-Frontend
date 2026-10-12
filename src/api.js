const API_BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ==================== STUDENT API ====================

export const studentApi = {
  getAll: () => request('/students'),

  getById: (id) => request(`/students/${id}`),

  create: (student) =>
    request('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    }),

  update: (id, student) =>
    request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    }),

  delete: (id) =>
    request(`/students/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== SUBJECT API ====================

export const subjectApi = {
  getAll: () => request('/subjects'),

  getById: (id) => request(`/subjects/${id}`),

  create: (subject) =>
    request('/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    }),

  update: (id, subject) =>
    request(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    }),

  delete: (id) =>
    request(`/subjects/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== ATTENDANCE API ====================

export const attendanceApi = {
  getAll: () => request('/attendance'),

  create: (attendance) =>
    request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendance),
    }),

  getById: (id) =>
    request(`/attendance/${id}`),

  update: (id, attendance) =>
    request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendance),
    }),

  delete: (id) =>
    request(`/attendance/${id}`, {
      method: 'DELETE',
    }),

  getPercentage: (studentId, subjectId) =>
    request(`/attendance/percentage/${studentId}/${subjectId}`),

  getReport: (studentId, subjectId) =>
    request(`/attendance/report/${studentId}/${subjectId}`),
};