// s2-backend/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const HybridAIService = require('../services/HybridAIService');

// Sample courses database
const courses = [
  {
    id: '1',
    title: 'Python Programming',
    description: 'Learn Python programming from scratch. Perfect for beginners who want to start coding.',
    category: 'Programming',
    level: 'Beginner',
    instructor: 'John Smith',
    duration: '7 weeks',
    rating: 4.5,
    enrolledStudents: 52,
    tags: ['python', 'programming', 'beginner', 'coding']
  },
  {
    id: '2',
    title: 'Web Development Fundamentals',
    description: 'Learn HTML, CSS, and JavaScript to build modern websites.',
    category: 'Web Development',
    level: 'Beginner',
    instructor: 'Sarah Johnson',
    duration: '6 weeks',
    rating: 4.7,
    enrolledStudents: 45,
    tags: ['web', 'html', 'css', 'javascript', 'beginner']
  },
  {
    id: '3',
    title: 'Data Science with Python',
    description: 'Introduction to data science, analysis, and visualization using Python.',
    category: 'Data Science',
    level: 'Intermediate',
    instructor: 'Michael Chen',
    duration: '8 weeks',
    rating: 4.7,
    enrolledStudents: 32,
    tags: ['data', 'python', 'analysis', 'visualization']
  },
  {
    id: '4',
    title: 'React for Beginners',
    description: 'Learn React.js to build modern web applications with reusable components.',
    category: 'Web Development',
    level: 'Beginner',
    instructor: 'Emma Wilson',
    duration: '6 weeks',
    rating: 4.7,
    enrolledStudents: 41,
    tags: ['react', 'javascript', 'frontend', 'web']
  },
  {
    id: '5',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to AI and machine learning concepts and algorithms.',
    category: 'AI/ML',
    level: 'Intermediate',
    instructor: 'Dr. AI Expert',
    duration: '10 weeks',
    rating: 4.6,
    enrolledStudents: 28,
    tags: ['ai', 'ml', 'machine learning', 'algorithms']
  },
  {
    id: '6',
    title: 'JavaScript Mastery',
    description: 'Master JavaScript with advanced concepts and modern frameworks.',
    category: 'Programming',
    level: 'Advanced',
    instructor: 'Alex Johnson',
    duration: '8 weeks',
    rating: 4.8,
    enrolledStudents: 38,
    tags: ['javascript', 'advanced', 'es6', 'frameworks']
  },
  {
    id: '7',
    title: 'UI/UX Design Principles',
    description: 'Learn user interface and user experience design fundamentals.',
    category: 'Design',
    level: 'Beginner',
    instructor: 'Lisa Wong',
    duration: '5 weeks',
    rating: 4.4,
    enrolledStudents: 29,
    tags: ['design', 'ui', 'ux', 'figma']
  },
  {
    id: '8',
    title: 'Database Management',
    description: 'Learn SQL and NoSQL databases for application development.',
    category: 'Database',
    level: 'Intermediate',
    instructor: 'Robert Chen',
    duration: '6 weeks',
    rating: 4.5,
    enrolledStudents: 34,
    tags: ['database', 'sql', 'mongodb', 'backend']
  },
  {
    id: '9',
    title: 'Mobile App Development',
    description: 'Build mobile apps with React Native for iOS and Android.',
    category: 'Mobile Development',
    level: 'Intermediate',
    instructor: 'Maria Garcia',
    duration: '9 weeks',
    rating: 4.6,
    enrolledStudents: 27,
    tags: ['mobile', 'react native', 'ios', 'android']
  },
  {
    id: '10',
    title: 'Cybersecurity Basics',
    description: 'Introduction to cybersecurity principles and best practices.',
    category: 'Security',
    level: 'Beginner',
    instructor: 'David Kim',
    duration: '4 weeks',
    rating: 4.3,
    enrolledStudents: 31,
    tags: ['security', 'cybersecurity', 'hacking', 'protection']
  }
];

// Helper function to calculate relevance score
const calculateRelevanceScore = (course, interest, level) => {
  let score = 50; // Base score
  
  // Title match
  if (course.title.toLowerCase().includes(interest)) score += 30;
  
  // Description match
  if (course.description.toLowerCase().includes(interest)) score += 20;
  
  // Category match
  if (course.category.toLowerCase().includes(interest)) score += 25;
  
  // Tag match
  if (course.tags.some(tag => tag.toLowerCase().includes(interest))) score += 15;
  
  // Level match
  if (course.level.toLowerCase() === level) score += 20;
  
  // Popularity bonus
  if (course.enrolledStudents > 30) score += 10;
  if (course.rating > 4.5) score += 10;
  
  return Math.min(score, 100);
};

// Helper function to generate why recommended text
const generateWhyRecommended = (course, interest, level) => {
  const reasons = [];
  
  if (course.title.toLowerCase().includes(interest.toLowerCase())) {
    reasons.push('Course title matches your interest');
  }
  
  if (course.level.toLowerCase() === level.toLowerCase()) {
    reasons.push(`Perfect for ${level} level`);
  }
  
  if (course.rating >= 4.5) {
    reasons.push('Highly rated by students');
  }
  
  if (course.enrolledStudents > 30) {
    reasons.push('Popular course with many students');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Well-suited for your learning goals';
};

// AI-powered course recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { interest, level = 'beginner', context = 'course_recommendation' } = req.body;
    
    if (!interest) {
      return res.json({
        success: false,
        error: 'Interest field is required'
      });
    }
    
    console.log(`🎯 AI Recommendation for: "${interest}" (Level: ${level})`);
    
    // Step 1: Use AI to understand the interest and get recommendations
    const aiPrompt = `As an AI learning advisor, recommend courses for someone interested in "${interest}" at "${level}" level. 
    Consider their skill level and suggest appropriate learning paths. 
    Provide 3-5 specific course recommendations with reasons why they are suitable.`;
    
    let aiResponse;
    try {
      aiResponse = await HybridAIService.getResponse(
        aiPrompt,
        'You are an AI learning advisor. Provide specific course recommendations based on user interests and skill level.',
        { provider: 'auto' }
      );
    } catch (aiError) {
      console.log('AI service failed, using fallback:', aiError.message);
      aiResponse = `Based on your interest in "${interest}" at "${level}" level, here are some recommendations:`;
    }
    
    // Step 2: Filter courses based on interest and level
    const interestLower = interest.toLowerCase();
    const levelLower = level.toLowerCase();
    
    let matchedCourses = courses.filter(course => {
      const courseText = `${course.title} ${course.description} ${course.category} ${course.tags.join(' ')}`.toLowerCase();
      
      // Check if course matches interest
      const matchesInterest = courseText.includes(interestLower) ||
                             course.tags.some(tag => tag.toLowerCase().includes(interestLower));
      
      // Check if course matches level (allow some flexibility)
      const matchesLevel = course.level.toLowerCase() === levelLower ||
                          (levelLower === 'beginner' && course.level.toLowerCase() === 'intermediate') ||
                          (levelLower === 'intermediate' && (course.level.toLowerCase() === 'beginner' || course.level.toLowerCase() === 'advanced'));
      
      return matchesInterest && matchesLevel;
    });
    
    // If no exact matches, try broader search
    if (matchedCourses.length === 0) {
      matchedCourses = courses.filter(course => {
        const courseText = `${course.title} ${course.description} ${course.category}`.toLowerCase();
        return courseText.includes(interestLower) || 
               course.category.toLowerCase().includes(interestLower);
      });
    }
    
    // If still no matches, return some beginner courses
    if (matchedCourses.length === 0) {
      matchedCourses = courses
        .filter(course => course.level.toLowerCase() === 'beginner')
        .slice(0, 3);
    }
    
    // Add relevance score
    const recommendations = matchedCourses.slice(0, 5).map(course => ({
      ...course,
      relevanceScore: calculateRelevanceScore(course, interestLower, levelLower),
      whyRecommended: generateWhyRecommended(course, interest, level)
    }));
    
    res.json({
      success: true,
      message: aiResponse,
      interest: interest,
      level: level,
      recommendations: recommendations,
      courses: recommendations, // For backward compatibility
      totalMatches: matchedCourses.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.json({
      success: false,
      error: error.message,
      message: `I found these courses for "${req.body.interest}":`,
      recommendations: courses.filter(c => c.level === 'beginner').slice(0, 3)
    });
  }
});

// Get all courses
router.get('/courses', (req, res) => {
  res.json({
    success: true,
    courses: courses,
    count: courses.length,
    categories: [...new Set(courses.map(c => c.category))]
  });
});

// Search courses
router.post('/search', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const queryLower = query.toLowerCase();
    
    const results = courses.filter(course => {
      const searchText = `${course.title} ${course.description} ${course.category} ${course.tags.join(' ')}`.toLowerCase();
      return searchText.includes(queryLower);
    }).map(course => ({
      ...course,
      relevanceScore: calculateRelevanceScore(course, queryLower, 'beginner')
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    res.json({
      success: true,
      query: query,
      results: results,
      count: results.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.json({
      success: false,
      error: error.message,
      results: []
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI Recommendation API is working!',
    endpoints: {
      'POST /api/ai/recommend': 'Get AI-powered course recommendations',
      'POST /api/ai/search': 'Search courses',
      'GET /api/ai/courses': 'Get all courses',
      'GET /api/ai/test': 'Test endpoint'
    },
    totalCourses: courses.length
  });
});

// ========== ✅ COURSES ENDPOINT (for frontend compatibility) ==========
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: courses.length,
    data: courses
  });
});

module.exports = router;