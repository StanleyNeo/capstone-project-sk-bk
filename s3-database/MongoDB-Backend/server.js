const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Simple MongoDB connection
mongoose.connect('mongodb://localhost:27017/lms_analytics', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected to lms_analytics database');
}).catch(err => {
  console.log('⚠️ MongoDB not available, using in-memory data');
});

// School Schema
const schoolSchema = new mongoose.Schema({
  name: String,
  address: String,
  principal: String
});
const School = mongoose.model('School', schoolSchema);

// Initialize with sample data
const initData = async () => {
  try {
    const count = await School.countDocuments();
    if (count === 0) {
      await School.insertMany([
        { name: "Computer Science School", address: "123 Tech St", principal: "Dr. Smith" },
        { name: "Data Science Institute", address: "456 Data Ave", principal: "Prof. Johnson" },
        { name: "AI Research Center", address: "789 AI Blvd", principal: "Dr. Chen" },
        { name: "Engineering College", address: "101 Engineer Way", principal: "Prof. Wilson" },
        { name: "Business School", address: "202 Business Rd", principal: "Dr. Brown" }
      ]);
      console.log('✅ Sample schools data created');
    }
  } catch (error) {
    console.log('⚠️ Using in-memory schools data');
  }
};

// ========== ✅ ALL ROUTES ==========

// Root
app.get('/', (req, res) => {
  res.json({
    message: '📊 LMS Analytics API',
    version: '2.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'In-memory',
    endpoints: [
      'GET  /api/health - Health check',
      'GET  /api/schools - All schools',
      'POST /api/schools - Add school',
      'GET  /api/search/health - Search health',
      'GET  /api/courses - All courses',
      'GET  /api/search/courses?q=query - Search courses'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all schools
app.get('/api/schools', async (req, res) => {
  try {
    let schools;
    if (mongoose.connection.readyState === 1) {
      schools = await School.find().lean();
    } else {
      // In-memory fallback
      schools = [
        { _id: '1', name: "Computer Science School", address: "123 Tech St", principal: "Dr. Smith" },
        { _id: '2', name: "Data Science Institute", address: "456 Data Ave", principal: "Prof. Johnson" },
        { _id: '3', name: "AI Research Center", address: "789 AI Blvd", principal: "Dr. Chen" },
        { _id: '4', name: "Engineering College", address: "101 Engineer Way", principal: "Prof. Wilson" },
        { _id: '5', name: "Business School", address: "202 Business Rd", principal: "Dr. Brown" }
      ];
    }
    
    res.json({
      success: true,
      count: schools.length,
      data: schools
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new school
app.post('/api/schools', async (req, res) => {
  try {
    const { name, address, principal } = req.body;
    
    if (!name || !address || !principal) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, address, and principal are required' 
      });
    }
    
    let newSchool;
    if (mongoose.connection.readyState === 1) {
      newSchool = new School({ name, address, principal });
      await newSchool.save();
    } else {
      // In-memory fallback
      newSchool = { 
        _id: Date.now().toString(),
        name, 
        address, 
        principal 
      };
    }
    
    res.json({
      success: true,
      message: 'School added successfully',
      data: newSchool
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search health endpoint (for AI)
app.get('/api/search/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'Search API',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'MongoDB' : 'In-memory'
  });
});

// Search courses (for AI search)
app.get('/api/search/courses', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  const courses = [
    { id: 'WEB101', title: 'Web Development Fundamentals', description: 'Learn HTML, CSS, JavaScript', category: 'Web Development', level: 'Beginner' },
    { id: 'DS201', title: 'Data Science with Python', description: 'Data analysis and visualization', category: 'Data Science', level: 'Intermediate' },
    { id: 'AI301', title: 'Machine Learning Fundamentals', description: 'Introduction to AI and ML', category: 'AI/ML', level: 'Advanced' },
    { id: 'REA201', title: 'React for Beginners', description: 'Learn React framework', category: 'Web Development', level: 'Intermediate' },
    { id: 'PYT101', title: 'Python Programming', description: 'Python from basics to advanced', category: 'Programming', level: 'Beginner' }
  ];
  
  const results = query ? 
    courses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    ) : 
    courses;
  
  res.json({
    success: true,
    query,
    count: results.length,
    results,
    timestamp: new Date().toISOString()
  });
});

// Get all courses
app.get('/api/courses', (req, res) => {
  const courses = [
    { id: 'WEB101', title: 'Web Development Fundamentals', description: 'Learn HTML, CSS, JavaScript', category: 'Web Development', level: 'Beginner', duration: '6 weeks', price: 49.99 },
    { id: 'DS201', title: 'Data Science with Python', description: 'Data analysis and visualization', category: 'Data Science', level: 'Intermediate', duration: '8 weeks', price: 79.99 },
    { id: 'AI301', title: 'Machine Learning Fundamentals', description: 'Introduction to AI and ML', category: 'AI/ML', level: 'Advanced', duration: '10 weeks', price: 99.99 },
    { id: 'REA201', title: 'React for Beginners', description: 'Learn React framework', category: 'Web Development', level: 'Intermediate', duration: '6 weeks', price: 69.99 },
    { id: 'PYT101', title: 'Python Programming', description: 'Python from basics to advanced', category: 'Programming', level: 'Beginner', duration: '7 weeks', price: 39.99 }
  ];
  
  res.json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// Start server
const startServer = async () => {
  await initData();
  
  app.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 MONGODB BACKEND (Schools & Search)
    ========================================
    📍 Port: ${PORT}
    🌐 URL: http://localhost:${PORT}
    💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'In-memory ⚠️'}
    
    🏫 Schools: http://localhost:${PORT}/api/schools
    🔍 Search: http://localhost:${PORT}/api/search/health
    🏥 Health: http://localhost:${PORT}/api/health
    ========================================
    `);
  });
};

startServer().catch(console.error);