const COURSES_API_URL = 'http://localhost:5001';  // AI LMS Backend
const SCHOOLS_API_URL = 'http://localhost:5000';  // MongoDB Backend

class ApiService {
  // ========== AUTHENTICATION (Port 5001) ==========
  static async register(userData) {
    try {
      const response = await fetch(`${COURSES_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
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
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection failed' };
    }
  }

  // ========== COURSES (Port 5001) ==========
  static async getCourses() {
    try {
      const response = await fetch(`${COURSES_API_URL}/courses`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to sample data
      return [
        { id: 1, name: 'React for Beginners', description: 'Learn React fundamentals', level: 'Beginner' },
        { id: 2, name: 'Data Science', description: 'Master data analysis', level: 'Intermediate' },
        { id: 3, name: 'AI Fundamentals', description: 'Understand AI and ML', level: 'Advanced' }
      ];
    }
  }

  static async getCourseById(id) {
    try {
      const response = await fetch(`${COURSES_API_URL}/courses/${id}`);
      const data = await response.json();
      return data.success ? data.data : null;
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
      return await response.json();
    } catch (error) {
      console.error('Error enrolling:', error);
      return { success: false, error: 'Enrollment failed' };
    }
  }

  static async updateProgress(userId, courseId, progress) {
    try {
      const response = await fetch(`${COURSES_API_URL}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId, progress })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: 'Update failed' };
    }
  }

  // ========== AI RECOMMENDATIONS (Port 5001) ==========
  static async getRecommendations(interest, level = 'beginner') {
    try {
      const response = await fetch(
        `${COURSES_API_URL}/recommend?interest=${encodeURIComponent(interest)}&level=${level}`
      );
      const data = await response.json();
      return data.success ? data.data : { recommendations: [] };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return { recommendations: [] };
    }
  }

  // ========== SCHOOLS (Port 5000) ==========
  static async getSchools() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/schools`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  }

  static async addSchool(schoolData) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/schools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding school:', error);
      return { success: false, error: 'Failed to add school' };
    }
  }

  // ========== SEARCH ENDPOINTS (Port 5000) ==========
  static async search(query, type = 'smart') {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type })
      });
      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: 'Search failed', results: [] };
    }
  }

  static async enhancedSearch(query) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/search/enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      return await response.json();
    } catch (error) {
      console.error('Enhanced search error:', error);
      return { success: false, error: 'Enhanced search failed', results: [] };
    }
  }

  static async getSearchSuggestions(query) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Suggestions error:', error);
      return { success: false, suggestions: [] };
    }
  }

  // ========== ANALYTICS (Port 5000) ==========
  static async getStats() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/stats`);
      return await response.json();
    } catch (error) {
      console.error('Stats error:', error);
      return { success: false, data: { users: 0, courses: 0, enrollments: 0 } };
    }
  }

  static async getAnalyticsSummary() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/analytics/summary`);
      return await response.json();
    } catch (error) {
      console.error('Analytics error:', error);
      return { success: false, data: { totals: { users: 0, courses: 0, enrollments: 0 } } };
    }
  }

  // ========== USER COURSES (MOCK for now) ==========
  static async getUserCourses() {
    // Return mock data to prevent errors
    return {
      success: true,
      data: [
        { id: 1, name: 'Python Programming', progress: 75, enrolledDate: '2024-01-15' },
        { id: 2, name: 'Web Development', progress: 45, enrolledDate: '2024-02-01' },
        { id: 3, name: 'Data Science Basics', progress: 20, enrolledDate: '2024-02-10' }
      ]
    };
  }

  // ========== HEALTH CHECK ==========
  static async checkSearchHealth() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/search/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return { success: false, status: 'unavailable' };
    }
  }

  // ========== TEST CONNECTIONS ==========
  static async testConnections() {
    const results = {};
    
    try {
      const coursesResponse = await fetch(`${COURSES_API_URL}/`);
      results.coursesBackend = coursesResponse.ok;
    } catch {
      results.coursesBackend = false;
    }
    
    try {
      const schoolsResponse = await fetch(`${SCHOOLS_API_URL}/`);
      results.schoolsBackend = schoolsResponse.ok;
    } catch {
      results.schoolsBackend = false;
    }
    
    return results;
  }

// ========== CHATBOT ENDPOINTS (Port 5000) ==========
static async sendChatMessage(message, context = {}) {
  try {
    const response = await fetch(`${SCHOOLS_API_URL}/api/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    return await response.json();
  } catch (error) {
    console.error('Chat error:', error);
    return { 
      success: false, 
      response: "I apologize, but I'm having connection issues. Please try again later.",
      type: 'error'
    };
  }
}

static async getChatStarters() {
  try {
    const response = await fetch(`${SCHOOLS_API_URL}/api/chatbot/starters`);
    return await response.json();
  } catch (error) {
    console.error('Starters error:', error);
    return { success: false, starters: [] };
  }
}

static async getChatbotInfo() {
  try {
    const response = await fetch(`${SCHOOLS_API_URL}/api/chatbot/info`);
    return await response.json();
  } catch (error) {
    console.error('Chatbot info error:', error);
    return { success: false, name: 'AI Learning Assistant' };
  }
}

static async checkChatbotHealth() {
  try {
    const response = await fetch(`${SCHOOLS_API_URL}/api/chatbot/health`);
    return await response.json();
  } catch (error) {
    console.error('Chatbot health error:', error);
    return { success: false, status: 'unavailable' };
  }
}

}

export default ApiService;