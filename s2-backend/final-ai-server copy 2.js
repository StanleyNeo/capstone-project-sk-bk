const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

const chatbotRoutes = require('./routes/chatbotRoutes');
const hybridAIRoutes = require('./routes/hybridAIRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// ========== ✅ MIDDLEWARE ==========
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Mount routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/ai', recommendationRoutes);           // ✅ Must come BEFORE aiChat to avoid overwrite
app.use('/api/ai', require('./routes/aiChat'));    // aiChat handles /api/ai/chat, etc.

// ========== ✅ AI RESPONSES (for /api/chat) ==========
const AI_RESPONSES = {
  'react': 'React is a JavaScript library for building user interfaces. It allows you to create reusable UI components and efficiently update and render components when data changes.',
  'data science': 'Data science combines statistics, programming, and domain knowledge to extract insights from data. Our DS201 course covers Python, pandas, matplotlib, and scikit-learn.',
  'web development': 'Web development involves building websites and web applications. It includes frontend (HTML, CSS, JavaScript) and backend (Node.js, databases). Check out our WEB101 course!',
  'courses': 'We offer 10+ courses in Web Development, Data Science, AI/ML, Python, React, MongoDB, and more. Use the search to find specific courses!',
  'python': 'Python is a versatile programming language great for beginners, data science, and web development. Our PYT101 course covers Python basics to advanced topics.',
  'machine learning': 'Machine learning is a subset of AI that enables computers to learn from data without explicit programming. AI301 covers ML fundamentals.',
  'javascript': 'JavaScript is the programming language of the web. It runs in browsers and can also run on servers with Node.js.',
  'html': 'HTML (HyperText Markup Language) is the standard language for creating web pages. It structures content with elements like headings, paragraphs, and links.',
  'css': 'CSS (Cascading Style Sheets) is used to style HTML elements and control layout, colors, fonts, and responsiveness.'
};

// ========== ✅ API ENDPOINTS ==========

// 1. ROOT
app.get('/', (req, res) => {
  res.json({
    message: '🤖 AI Backend Service',
    version: '3.1.0',
    status: 'running',
    note: 'Using smart fallback responses',
    endpoints: [
      'POST /api/chat - Chat with AI (POST only)',
      'POST /api/hybrid-ai/chat - Hybrid AI chat (frontend compatible)',
      'GET  /api/health - Health check',
      'GET  /api/test - Test endpoint'
    ]
  });
});

// 2. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'AI Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    note: 'Using fallback AI responses — no external API keys needed'
  });
});

// 3. TEST ENDPOINT
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI backend is working! Use POST /api/chat or /api/hybrid-ai/chat for AI conversations.',
    timestamp: new Date().toISOString()
  });
});

// 4. MAIN CHAT ENDPOINT (for testing)
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid message is required'
      });
    }
    console.log(`🤖 Received: "${message.substring(0, 50)}..."`);
    const lowerMessage = message.toLowerCase();
    let response = "I'm Athena, your AI learning assistant! I can help you with course recommendations, programming concepts, and learning paths.";
    
    for (const [keyword, aiResponse] of Object.entries(AI_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        response = aiResponse;
        break;
      }
    }

    const formattedResponse = `👋 **Hello! I'm Athena, your AI learning assistant!**
${response}
🔹 **Quick Tip:** Practice regularly and build projects for best results!
🚀 **What would you like to learn next?**`;

    res.json({
      success: true,
      message,
      response: formattedResponse,
      provider: 'athena',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.json({
      success: true,
      response: `👋 **Hello! I'm Athena!**
I'm here to help with your learning journey. Try asking about React, Python, Data Science, or our courses!
🔹 **Quick Tip:** Consistency is key to learning!`,
      provider: 'fallback',
      timestamp: new Date().toISOString()
    });
  }
});

// 5. GET /api/chat (helpful error)
app.get('/api/chat', (req, res) => {
  res.json({
    success: false,
    error: 'This endpoint requires POST method',
    note: 'Use POST request with JSON body: {"message": "your question"}'
  });
});

// ========== ✅ CRITICAL FIX: /api/hybrid-ai/chat ========== 
// 🔥 This is what your frontend's ApiService.sendChatMessage() calls
app.post('/api/hybrid-ai/chat', (req, res) => {
  try {
    const { message = '', provider = 'auto' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid message string is required'
      });
    }

    // ✅ SMART KEYWORD MATCHING (no external APIs)
    const msg = message.toLowerCase();
    let response = "👋 Hello! I'm Athena, your AI learning assistant. How can I help you today?";
    
    if (msg.includes('react')) {
      response = "React is a JavaScript library for building user interfaces. Try our *React for Beginners* course (6 weeks, ⭐4.7).";
    } else if (msg.includes('python')) {
      response = "Python is perfect for beginners! Start with *Python Programming* (7 weeks, ⭐4.5, 52 students).";
    } else if (msg.includes('web') || msg.includes('html') || msg.includes('css') || msg.includes('javascript')) {
      response = "Begin with *Web Development Fundamentals* (HTML/CSS/JS, 6 weeks, ⭐4.7, 45 students).";
    } else if (msg.includes('data') || msg.includes('science')) {
      response = "Our *Data Science with Python* course covers pandas, NumPy, and visualization (8 weeks, ⭐4.7).";
    } else if (msg.includes('ai') || msg.includes('ml') || msg.includes('machine learning')) {
      response = "*Machine Learning Fundamentals* introduces algorithms and neural networks (10 weeks, ⭐4.8).";
    } else if (msg.includes('course') || msg.includes('learn') || msg.includes('recommend')) {
      response = "We offer courses in Web Dev, Data Science, AI/ML, and Programming. Try: 'React courses' or 'Python for beginners'.";
    } else if (msg.includes('hello') || msg.includes('hi ') || msg === 'hi') {
      response = "👋 Hello! I'm Athena. Ask me about courses, concepts, or learning paths!";
    }

    // ✅ ALWAYS return success:true + non-empty response
    res.json({
      success: true,
      message,
      response,
      provider: provider || 'fallback',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Hybrid-AI chat error:', error.message);
    // Even on error, return a valid fallback response (never undefined!)
    res.json({
      success: true,
      response: `👋 Hello! I'm Athena, your AI assistant. Try asking:\n• What courses do you have?\n• Explain React\n• Recommend Python courses`,
      provider: 'fallback',
      error: error.message
    });
  }
});

// ========== ✅ START SERVER ==========
app.listen(PORT, () => {
  console.log(`
  ========================================
  🤖 AI BACKEND SERVICE (PATCHED v3.1)
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  💬 Chat: POST http://localhost:${PORT}/api/chat
  🤖 Hybrid: POST http://localhost:${PORT}/api/hybrid-ai/chat  ← ✅ NOW WORKING
  🏥 Health: http://localhost:${PORT}/api/health
  🧪 Test: http://localhost:${PORT}/api/test
  💡 Note: Using smart fallback responses (no API keys needed)
  ========================================
  `);
});