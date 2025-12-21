const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock database
let users = [];
let courses = [];
let enrollments = [];

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '📊 LMS Analytics API (Simple Version)',
    version: '1.0.0',
    status: 'Running without MongoDB',
    endpoints: [
      'GET  /api/stats - Quick statistics',
      'GET  /api/users - List all users',
      'GET  /api/courses - List all courses',
      'GET  /api/search/courses?q= - Search courses',
      'GET  /health - Health check'
    ]
  });
});

// Quick statistics
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      users: 10,
      courses: 8,
      enrollments: 15,
      timestamp: new Date().toISOString()
    }
  });
});

// Search courses
app.get('/api/search/courses', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  const sampleCourses = [
    { id: 1, title: 'Web Development Fundamentals', category: 'Web Dev', level: 'Beginner', rating: 4.5 },
    { id: 2, title: 'Data Science with Python', category: 'Data Science', level: 'Intermediate', rating: 4.7 },
    { id: 3, title: 'Machine Learning Fundamentals', category: 'AI/ML', level: 'Advanced', rating: 4.8 },
    { id: 4, title: 'React for Beginners', category: 'Web Dev', level: 'Beginner', rating: 4.6 },
    { id: 5, title: 'Python Programming', category: 'Programming', level: 'Beginner', rating: 4.4 }
  ];
  
  const results = query ? 
    sampleCourses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query)
    ) : 
    sampleCourses;
  
  res.json({
    success: true,
    query,
    count: results.length,
    results
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  const sampleUsers = [
    { userId: 'STU001', name: 'John Smith', email: 'john@example.com', role: 'student', enrolledCourses: 3 },
    { userId: 'STU002', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'student', enrolledCourses: 2 },
    { userId: 'INS001', name: 'Dr. Emily Wilson', email: 'emily@example.com', role: 'instructor', enrolledCourses: 0 }
  ];
  
  res.json({
    success: true,
    count: sampleUsers.length,
    data: sampleUsers
  });
});

// Get all courses
app.get('/api/courses', (req, res) => {
  const sampleCourses = [
    { courseId: 'WEB101', title: 'Web Development Fundamentals', category: 'Web Development', level: 'Beginner', enrolledStudents: 45 },
    { courseId: 'DS201', title: 'Data Science with Python', category: 'Data Science', level: 'Intermediate', enrolledStudents: 32 },
    { courseId: 'AI301', title: 'Machine Learning Fundamentals', category: 'AI/ML', level: 'Advanced', enrolledStudents: 28 }
  ];
  
  res.json({
    success: true,
    count: sampleCourses.length,
    data: sampleCourses
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ========================================
  📊 SIMPLE LMS ANALYTICS BACKEND
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  📊 Stats: http://localhost:${PORT}/api/stats
  🔍 Search: http://localhost:${PORT}/api/search/courses?q=web
  ========================================
  💡 Note: This is a simple version without MongoDB
  💡 For full features, install MongoDB and use server.js
  ========================================
  `);
});