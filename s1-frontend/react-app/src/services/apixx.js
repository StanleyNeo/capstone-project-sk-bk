const COURSES_API_URL = 'http://localhost:5001';  // AI LMS Backend
const SCHOOLS_API_URL = 'http://localhost:5000';  // MongoDB Analytics Backend

class ApiService {

  // ========== AUTHENTICATION ==========

  static async register(userData) {
    try {
      const response = await fetch(`${COURSES_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('Register returned non-JSON:', text);
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Connection failed' };
    }
  }

  static async login(credentials) {
    try {
      const response = await fetch(`${COURSES_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('Login returned non-JSON:', text);
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection failed' };
    }
  }

  // ========== COURSES (Port 5001) ==========
  static async getCourses() {
    try {
      const response = await fetch(`${COURSES_API_URL}/courses`);
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return Array.isArray(data.data) ? data.data : [];
      } catch {
        console.error('getCourses returned non-JSON:', text);
        return [];
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  static async getCourseById(id) {
    try {
      const response = await fetch(`${COURSES_API_URL}/courses/${id}`);
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data.success ? data.data : null;
      } catch {
        console.error('getCourseById returned non-JSON:', text);
        return null;
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  static async enrollCourse(userId, courseId) {
    try {
      const response = await fetch(`${COURSES_API_URL}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId })
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('enrollCourse returned non-JSON:', text);
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      return { success: false, error: 'Enrollment failed' };
    }
  }

  // ========== Other methods remain the same, but add safe JSON parsing for all fetch responses ==========

  // Example:
  static async getStats() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/stats`);
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('getStats returned non-JSON:', text);
        return { success: false, data: { users: 0, courses: 0, enrollments: 0 } };
      }
    } catch (error) {
      console.error('Stats error:', error);
      return { success: false, data: { users: 0, courses: 0, enrollments: 0 } };
    }
  }
}

export default ApiService;
