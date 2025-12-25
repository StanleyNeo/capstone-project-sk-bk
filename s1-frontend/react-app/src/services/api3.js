const COURSES_API_URL = 'http://localhost:5001';  // AI LMS Backend
const SCHOOLS_API_URL = 'http://localhost:5000';  // MongoDB Analytics Backend

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
      return [];
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

  // ========== AI & CHATBOT (Port 5001) ==========
  // Get AI recommendations
  static async getAiRecommendations(interest, level) {
    try {
      const response = await fetch('http://localhost:5001/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interest: interest,
          level: level,
          context: 'course_recommendation'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          message: data.message || 'AI Recommendations',
          recommendations: data.recommendations || [],
          courses: data.courses || []
        };
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('AI Recommendation error:', error);
      // Return fallback recommendations
      return this.getFallbackRecommendations(interest, level);
    }
  }

  // Fallback recommendations when AI is unavailable
  static getFallbackRecommendations(interest, level) {
    const allCourses = [
      {
        id: '1',
        title: 'Python Programming',
        description: 'Learn Python programming from scratch',
        category: 'Programming',
        level: 'Beginner',
        instructor: 'John Smith',
        duration: '7 weeks',
        rating: 4.5
      },
      {
        id: '2',
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript to build modern websites',
        category: 'Web Development',
        level: 'Beginner',
        instructor: 'Sarah Johnson',
        duration: '6 weeks',
        rating: 4.7
      },
      {
        id: '3',
        title: 'Data Science with Python',
        description: 'Introduction to data science, analysis, and visualization',
        category: 'Data Science',
        level: 'Intermediate',
        instructor: 'Michael Chen',
        duration: '8 weeks',
        rating: 4.7
      },
      {
        id: '4',
        title: 'React for Beginners',
        description: 'Learn React.js to build modern web applications',
        category: 'Web Development',
        level: 'Beginner',
        instructor: 'Emma Wilson',
        duration: '6 weeks',
        rating: 4.7
      },
      {
        id: '5',
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to AI and machine learning concepts',
        category: 'AI/ML',
        level: 'Intermediate',
        instructor: 'Dr. AI Expert',
        duration: '10 weeks',
        rating: 4.6
      }
    ];

    const filteredCourses = allCourses.filter(course => {
      const interestLower = interest.toLowerCase();
      const matchesInterest = 
        course.title.toLowerCase().includes(interestLower) ||
        course.description.toLowerCase().includes(interestLower) ||
        course.category.toLowerCase().includes(interestLower);
      
      const matchesLevel = course.level.toLowerCase() === level.toLowerCase();
      
      return matchesInterest && matchesLevel;
    });

    return {
      message: `Found ${filteredCourses.length} courses for "${interest}" at ${level} level`,
      recommendations: filteredCourses,
      courses: filteredCourses
    };
  }

  // AI Chat - USE PORT 5001 for AI
  static async sendChatMessage(message) {
    try {
      const response = await fetch(`${COURSES_API_URL}/api/hybrid-ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      return await response.json();
    } catch (error) {
      console.error('AI Chat error:', error);
      return { 
        success: false, 
        response: "I'm having connection issues. Please try again.",
        provider: 'error'
      };
    }
  }

  // Add this method if you need it (but check if you already have similar methods)
  static async getDashboardStats() {
    return await ApiService.getStats(); // Use your existing method
  }

  // And if you need a simple health check:
  static async checkHealth() {
    return await ApiService.checkAnalyticsBackend();
  }

  static async getAiProviders() {
    try {
      const response = await fetch(`${COURSES_API_URL}/api/hybrid-ai/providers`);
      return await response.json();
    } catch (error) {
      console.error('AI Providers error:', error);
      return { success: false, available: [] };
    }
  }

  // ========== ANALYTICS & SEARCH (Port 5000) ==========
  static async getStats() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/stats`);
      return await response.json(); // Returns { success: true, data: { ... } }
    } catch (error) {
      console.error('Stats error:', error);
      return { success: false, data: { users: 0, courses: 0, enrollments: 0 } };
    }
  }

  static async getAnalyticsSummary() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/analytics/summary`, {
        mode: 'cors', // Add this
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      console.log('Analytics summary response:', data);
      return data;
    } catch (error) {
      console.error('Analytics error:', error);
      return { success: false, data: { totals: { users: 0, courses: 0, enrollments: 0 } } };
    }
  }

  static async getAnalyticsDashboard() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/analytics/dashboard`);
      return await response.json();
    } catch (error) {
      console.error('Dashboard error:', error);
      return { success: false, data: { totals: { users: 0, courses: 0, enrollments: 0 } } };
    }
  }

  // ========== SEARCH (Port 5000) - CORRECTED ==========
  static async searchCourses(query) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/search/courses?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, query, results: [], count: 0 };
    }
  }

  static async getSearchHealth() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/search/health`);
      return await response.json();
    } catch (error) {
      console.error('Search health error:', error);
      return { success: false, status: 'unavailable' };
    }
  }

  // ========== USERS & ENROLLMENTS (Port 5000) ==========
  static async getUsers() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/users`);
      return await response.json();
    } catch (error) {
      console.error('Users error:', error);
      return { success: false, data: [], count: 0 };
    }
  }

  static async getUserEnrollments(userId) {
    try {
      // First, get all enrollments
      const response = await fetch(`${SCHOOLS_API_URL}/api/enrollments`);
      const data = await response.json();
      
      console.log('All enrollments fetched:', data);
      
      if (data.success && Array.isArray(data.data)) {
        // Filter enrollments by userId
        const userEnrollments = data.data.filter(enrollment => enrollment.userId === userId);
        
        console.log(`Filtered enrollments for user ${userId}:`, userEnrollments);
        
        return {
          success: true,
          data: userEnrollments,
          count: userEnrollments.length
        };
      }
      
      return { success: false, data: [], count: 0 };
    } catch (error) {
      console.error('User enrollments error:', error);
      return { success: false, data: [], count: 0 };
    }
  }

  static async getUserStats(userId) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/users/${userId}/stats`);
      return await response.json();
    } catch (error) {
      console.error('User stats error:', error);
      return { success: false, data: {} };
    }
  }

  static async getEnrollments() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/enrollments`);
      return await response.json();
    } catch (error) {
      console.error('Enrollments error:', error);
      return { success: false, data: [], count: 0 };
    }
  }

  // ========== COURSES DETAILS (Port 5000) ==========
  static async getCoursesFromAnalytics() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/courses`);
      const data = await response.json();
      
      console.log('Courses from analytics:', data);
      
      if (data.success) {
        return {
          success: true,
          data: data.data || [],
          count: data.count || 0
        };
      }
      
      return { success: false, data: [], count: 0 };
    } catch (error) {
      console.error('Courses error:', error);
      return { success: false, data: [], count: 0 };
    }
  }

  static async getCourseDetails(courseId) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/courses/${courseId}`);
      return await response.json();
    } catch (error) {
      console.error('Course details error:', error);
      return { success: false, data: null };
    }
  }

  static async getCourseEnrollmentStats(courseId) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/courses/${courseId}/enrollments`);
      return await response.json();
    } catch (error) {
      console.error('Course stats error:', error);
      return { success: false, data: {} };
    }
  }

  // ========== SCHOOLS CRUD OPERATIONS (Port 5000) ==========
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
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schoolData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding school:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateSchool(id, schoolData) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/schools/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schoolData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating school:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteSchool(id) {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/api/schools/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting school:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== HEALTH CHECKS ==========
  static async checkCoursesBackend() {
    try {
      const response = await fetch(`${COURSES_API_URL}/health`);
      return await response.json();
    } catch (error) {
      return { success: false, status: 'unavailable' };
    }
  }

  static async checkAnalyticsBackend() {
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/health`);
      return await response.json();
    } catch (error) {
      return { success: false, status: 'unavailable' };
    }
  }

  // ========== TEST CONNECTIONS ==========
  static async testConnections() {
    const results = {};
    
    // Test Port 5001 (AI Backend)
    try {
      const response = await fetch(`${COURSES_API_URL}/`);
      results.coursesBackend = response.ok;
    } catch {
      results.coursesBackend = false;
    }
    
    // Test Port 5000 (Analytics Backend)
    try {
      const response = await fetch(`${SCHOOLS_API_URL}/`);
      results.analyticsBackend = response.ok;
    } catch {
      results.analyticsBackend = false;
    }
    
    return results;
  }

  // ========== MOCK DATA (Fallbacks) ==========
  static getMockUserCourses() {
    return {
      success: true,
      data: [
        { id: 1, name: 'Python Programming', progress: 75, enrolledDate: '2024-01-15' },
        { id: 2, name: 'Web Development', progress: 45, enrolledDate: '2024-02-01' },
        { id: 3, name: 'Data Science Basics', progress: 20, enrolledDate: '2024-02-10' }
      ]
    };
  }
}

export default ApiService;