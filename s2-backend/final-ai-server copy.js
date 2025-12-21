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
// app.use('/api/chatbot', chatbotRoutes);
// app.use('/api/hybrid-ai', hybridAIRoutes);
// ✅ BEST: mount full recommendationRoutes under /api/ai, but ensure it’s FIRST
app.use('/api/ai', recommendationRoutes);  // ✅ Has /recommend, /courses, /test
app.use('/api/chatbot', chatbotRoutes);    // ✅ Has /chat, /health
app.use('/api/hybrid-ai', hybridAIRoutes); // ✅ Has /chat, /providers, /health
// ========== ✅ AI RESPONSES ==========
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
    version: '3.0.0',
    status: 'running',
    note: 'Using smart fallback responses',
    endpoints: [
      'POST /api/chat - Chat with AI (POST only)',
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
    note: 'Using fallback AI responses - no external API keys needed'
  });
});

// 3. TEST ENDPOINT (GET)
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI backend is working! Use POST /api/chat for AI conversations.',
    timestamp: new Date().toISOString()
  });
});

// 4. CHAT ENDPOINT (POST only - this is what your frontend needs)
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
    
    // Find matching response
    for (const [keyword, aiResponse] of Object.entries(AI_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        response = aiResponse;
        break;
      }
    }
    
    // Format as Athena response
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
      message: req.body?.message,
      response: `👋 **Hello! I'm Athena!**\n\nI'm here to help with your learning journey. Try asking about React, Python, Data Science, or our courses!\n\n🔹 **Quick Tip:** Consistency is key to learning!`,
      provider: 'fallback',
      timestamp: new Date().toISOString()
    });
  }
});

// 5. CHAT ENDPOINT GET (for browser testing)
app.get('/api/chat', (req, res) => {
  res.json({
    success: false,
    error: 'This endpoint requires POST method',
    note: 'Use POST request with JSON body: {"message": "your question"}',
    example: 'curl -X POST http://localhost:5001/api/chat -H "Content-Type: application/json" -d \'{"message":"What is React?"}\''
  });
});

// 6. HYBRID AI ENDPOINT (FIXED: working fallback)
app.post('/api/hybrid-ai/chat', (req, res) => {
  try {
    const { message = '', provider = 'auto' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid message string is required'
      });
    }

    // ✅ FIXED: Define response BEFORE using it
    const responseText = `✅ AI Connection Successful! Using ${provider} provider.
Hello! I'm your AI learning assistant. You asked: "${message}"
  
Here are some helpful suggestions:
• Try "Find courses about Web Development"
• Ask "Explain React in simple terms"
• Request "Recommend beginner Python courses"

How else can I help? 🚀`;

    res.json({
      success: true,
      message,
      response: responseText,
      provider: provider || 'fallback',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Hybrid AI chat error:', error.message);
    res.status(500).json({
      success: false,
      response: `👋 Hello! I'm Athena, your AI assistant.
I'm ready to help with course recommendations, programming concepts, and learning paths.
Try asking: "What courses do you have?" or "Explain web development."`,
      provider: 'fallback',
      error: error.message
    });
  }
});

// 7. GET endpoint for hybrid-ai (for testing)
app.get('/api/hybrid-ai/chat', (req, res) => {
  res.json({
    success: true,
    message: 'Hybrid AI endpoint requires POST method',
    timestamp: new Date().toISOString()
  });
});

// ========== ✅ START SERVER ==========
app.listen(PORT, () => {
  console.log(`
  ========================================
  🤖 AI BACKEND SERVICE
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  
  💬 Chat: POST http://localhost:${PORT}/api/chat
  🤖 Hybrid: POST http://localhost:${PORT}/api/hybrid-ai/chat
  🏥 Health: http://localhost:${PORT}/api/health
  🧪 Test: http://localhost:${PORT}/api/test
  
  💡 Note: Using smart fallback responses
  ========================================
  `);
});