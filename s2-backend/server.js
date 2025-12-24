const express = require('express');
const hybridAiRoutes = require('./routes/hybridAiRoutes');
const openaiRoutes = require('./routes/openaiRoutes');

const app = express();
const PORT = 5001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use('/api/hybrid-ai', hybridAiRoutes);
app.use('/api/ai', openaiRoutes);

// In-memory database
let users = [];
let courses = [
  { 
    id: 1, 
    name: 'React for Beginners',
    description: 'Learn React fundamentals and build your first application.',
    duration: '4 weeks',
    level: 'Beginner',
    category: 'Web Development',
    instructor: 'Sarah Johnson',
    price: '$49.99',
    rating: 4.8,
    students: 1250,
    modules: 12,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'
  },
  { 
    id: 2, 
    name: 'Intro to Data Science',
    description: 'Master data analysis and machine learning concepts with Python.',
    duration: '6 weeks',
    level: 'Intermediate',
    category: 'Data Science',
    instructor: 'Michael Chen',
    price: '$69.99',
    rating: 4.7,
    students: 890,
    modules: 16,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
  },
  { 
    id: 3, 
    name: 'AI Fundamentals',
    description: 'Understand artificial intelligence and machine learning from ground up.',
    duration: '8 weeks',
    level: 'Advanced',
    category: 'AI/ML',
    instructor: 'Dr. Emily Wilson',
    price: '$89.99',
    rating: 4.9,
    students: 540,
    modules: 20,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'
  },
  { 
    id: 4, 
    name: 'Full Stack Web Development',
    description: 'Build complete web applications with React, Node.js, and MongoDB.',
    duration: '12 weeks',
    level: 'Intermediate',
    category: 'Web Development',
    instructor: 'David Lee',
    price: '$99.99',
    rating: 4.6,
    students: 2100,
    modules: 24,
    image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400'
  },
  { 
    id: 5, 
    name: 'Python Programming',
    description: 'Master Python programming from basics to advanced topics.',
    duration: '5 weeks',
    level: 'Beginner',
    category: 'Programming',
    instructor: 'Robert Smith',
    price: '$39.99',
    rating: 4.5,
    students: 3100,
    modules: 14,
    image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec6?w=400'
  }
];

// ========== HELPER FUNCTIONS ==========
const generateUserId = () => 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// Password validation function
const validatePassword = (password) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
    noSpaces: !/\s/.test(password)
  };

  const failedRequirements = Object.entries(requirements)
    .filter(([_, met]) => !met)
    .map(([key]) => key);

  let score = Math.floor(
    (Object.values(requirements).filter(Boolean).length / 6) * 100
  );

  // Additional scoring for length
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  score = Math.min(100, score);

  return {
    valid: failedRequirements.length === 0,
    failedRequirements,
    score,
    strength: score >= 70 ? 'Strong' : 
             score >= 40 ? 'Medium' : 'Weak'
  };
};

// ========== API ENDPOINTS ==========

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🎓 AI LMS Backend API (Port 5001)',
    status: '🚀 Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      courses: 'GET  /courses',
      register: 'POST /api/register',
      login: 'POST /api/login',
      recommend: 'GET  /recommend?interest=&level=',
      enroll: 'POST /enroll',
      users: `Currently ${users.length} registered users`
    }
  });
});

// Get all courses
app.get('/courses', (req, res) => {
  res.json({ 
    success: true, 
    data: courses,
    count: courses.length,
    message: `Found ${courses.length} courses`
  });
});

// Get course by ID
app.get('/courses/:id', (req, res) => {
  const course = courses.find(c => c.id == req.params.id);
  if (!course) {
    return res.status(404).json({ 
      success: false, 
      error: 'Course not found' 
    });
  }
  res.json({ success: true, data: course });
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password does not meet security requirements',
        failedRequirements: passwordValidation.failedRequirements,
        strength: passwordValidation.strength,
        score: passwordValidation.score
      });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }
    
    // Create new user
    const user = {
      id: generateUserId(),
      name,
      email,
      password, // Note: In production, hash this!
      enrolledCourses: [],
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    console.log(`✅ New user registered: ${email}`);
    
    res.json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        enrolledCourses: user.enrolledCourses
      },
      passwordStrength: {
        score: passwordValidation.score,
        strength: passwordValidation.strength
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    // Check password
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    console.log(`✅ User logged in: ${email}`);
    
    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        enrolledCourses: user.enrolledCourses || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// AI Recommendations
app.get('/recommend', (req, res) => {
  const interest = (req.query.interest || '').toLowerCase();
  const level = (req.query.level || 'beginner').toLowerCase();
  
  console.log(`🤖 AI Recommendation request: interest="${interest}", level="${level}"`);
  
  let recommendations = [];
  
  // AI Logic
  if (interest.includes('web') || interest.includes('react') || interest.includes('frontend')) {
    recommendations = courses.filter(c => 
      c.category.toLowerCase().includes('web') && 
      c.level.toLowerCase() === level
    );
  } else if (interest.includes('data') || interest.includes('python') || interest.includes('analysis')) {
    recommendations = courses.filter(c => 
      (c.category.toLowerCase().includes('data') || c.category.toLowerCase().includes('programming')) && 
      c.level.toLowerCase() === level
    );
  } else if (interest.includes('ai') || interest.includes('machine') || interest.includes('neural')) {
    recommendations = courses.filter(c => 
      c.category.toLowerCase().includes('ai') && 
      c.level.toLowerCase() === level
    );
  } else if (interest.includes('design') || interest.includes('ui') || interest.includes('ux')) {
    recommendations = courses.filter(c => 
      c.category.toLowerCase().includes('design') && 
      c.level.toLowerCase() === level
    );
  } else {
    // Default recommendations by level
    recommendations = courses
      .filter(c => c.level.toLowerCase() === level)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }
  
  // Fallback if no matches
  if (recommendations.length === 0) {
    recommendations = courses
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }
  
  res.json({
    success: true,
    data: {
      interest,
      level,
      recommendations,
      count: recommendations.length,
      message: `🤖 AI found ${recommendations.length} perfect courses for you!`
    }
  });
});

// Enroll in course
app.post('/enroll', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Course ID required'
      });
    }
    
    // Find course
    const course = courses.find(c => c.id == courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    // Find user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if already enrolled
    const enrolledCourses = user.enrolledCourses || [];
    const isEnrolled = enrolledCourses.some(c => c.courseId == courseId);
    
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        error: 'You are already enrolled in this course'
      });
    }
    
    // Enroll user
    enrolledCourses.push({
      courseId: course.id,
      courseName: course.name,
      progress: 0,
      enrolledAt: new Date().toISOString()
    });
    
    user.enrolledCourses = enrolledCourses;
    
    console.log(`✅ User ${user.email} enrolled in "${course.name}"`);
    
    res.json({
      success: true,
      message: `🎉 Successfully enrolled in "${course.name}"!`,
      data: {
        courseId: course.id,
        courseName: course.name,
        progress: 0,
        enrolledAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Enrollment failed'
    });
  }
});

// Update progress
app.post('/progress', async (req, res) => {
  try {
    const { userId, courseId, progress } = req.body;
    
    if (!userId || !courseId || progress === undefined) {
      return res.status(400).json({
        success: false,
        error: 'User ID, Course ID, and Progress required'
      });
    }
    
    // Find user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Find enrolled course
    const enrolledCourses = user.enrolledCourses || [];
    const courseIndex = enrolledCourses.findIndex(c => c.courseId == courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Course not found in your enrolled courses'
      });
    }
    
    // Update progress (0-100)
    const newProgress = Math.min(100, Math.max(0, Number(progress)));
    enrolledCourses[courseIndex].progress = newProgress;
    enrolledCourses[courseIndex].updatedAt = new Date().toISOString();
    
    user.enrolledCourses = enrolledCourses;
    
    console.log(`📈 Progress updated: User ${user.email}, Course ${courseId}, Progress ${newProgress}%`);
    
    res.json({
      success: true,
      message: 'Progress updated successfully!',
      data: enrolledCourses[courseIndex]
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress'
    });
  }
});

// Add password validation endpoint
app.post('/api/validate-password', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required'
    });
  }
  
  const validation = validatePassword(password);
  
  res.json({
    success: true,
    data: {
      valid: validation.valid,
      score: validation.score,
      strength: validation.strength,
      failedRequirements: validation.failedRequirements
    }
  });
});

// Get user data
app.get('/api/user/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  // Don't send password
  const { password, ...userData } = user;
  
  res.json({
    success: true,
    data: userData
  });
});




// Get all users (for debugging)
app.get('/api/users', (req, res) => {
  // Remove passwords for security
  const safeUsers = users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
  
  res.json({
    success: true,
    count: users.length,
    data: safeUsers
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    users: users.length,
    courses: courses.length
  });
});

// Add this BEFORE app.listen()
app.get('/api/test-ai', async (req, res) => {
  res.json({
    success: true,
    message: 'AI Service Test',
    endpoints: {
      hybridAi: '/api/hybrid-ai/*',
      health: '/api/hybrid-ai/health',
      chat: 'POST /api/hybrid-ai/chat',
      stats: '/api/hybrid-ai/stats'
    },
    timestamp: new Date().toISOString()
  });
});

// Add a simple direct AI endpoint
app.post('/api/ai-direct', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.json({
        success: false,
        response: "Please provide a message"
      });
    }
    
    // Import the AI service directly
    const HybridAIService = require('./services/HybridAIService');
    const response = await HybridAIService.queryAI(
      message,
      "You are a helpful AI tutor. Answer clearly and helpfully."
    );
    
    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.json({
      success: true,
      response: "I'm here to help! Ask me about programming, courses, or learning advice.",
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 AI LMS BACKEND STARTED SUCCESSFULLY!
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  📚 Courses: http://localhost:${PORT}/courses
  🔐 Register: POST http://localhost:${PORT}/api/register
  🔓 Login: POST http://localhost:${PORT}/api/login
  🤖 AI Rec: GET http://localhost:${PORT}/recommend?interest=ai&level=beginner
  ========================================
  `);
  
  // Add some sample users for testing
  if (users.length === 0) {
    users.push({
      id: 'demo_user_1',
      name: 'Demo Student',
      email: 'student@demo.com',
      password: 'demo123',
      enrolledCourses: [
        { courseId: 1, courseName: 'React for Beginners', progress: 30, enrolledAt: '2024-01-15' },
        { courseId: 3, courseName: 'AI Fundamentals', progress: 10, enrolledAt: '2024-01-20' }
      ],
      createdAt: '2024-01-01'
    });
    
    users.push({
      id: 'demo_user_2',
      name: 'Test Instructor',
      email: 'instructor@demo.com',
      password: 'demo123',
      enrolledCourses: [
        { courseId: 2, courseName: 'Intro to Data Science', progress: 75, enrolledAt: '2024-01-10' }
      ],
      createdAt: '2024-01-05'
    });
    
    console.log(`✅ Added ${users.length} demo users for testing`);
    console.log(`   👤 student@demo.com / demo123`);
    console.log(`   👤 instructor@demo.com / demo123`);
  }
});