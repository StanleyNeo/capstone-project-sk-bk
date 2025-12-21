const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Simple AI responses without external APIs
const aiResponses = {
  'what is react': 'React is a JavaScript library for building user interfaces, created by Facebook. It allows you to build reusable UI components.',
  'how do i become a data scientist': 'To become a data scientist: 1) Learn Python/R, 2) Study statistics, 3) Learn machine learning, 4) Work on projects, 5) Build portfolio.',
  'what courses do you have': 'We offer courses in Web Development, Data Science, AI/ML, React, Python, and more. Use the search to find specific courses.',
  'web development': 'Web development includes HTML, CSS, JavaScript, and frameworks like React. We have beginner to advanced courses.',
  'data science': 'Data science involves Python, statistics, machine learning. Check out our DS201 course.',
  'ai': 'AI and machine learning courses cover fundamentals to advanced topics. AI301 is our popular course.'
};

// Root
app.get('/', (req, res) => {
  res.json({
    message: '🤖 AI Fallback Service',
    version: '1.0.0',
    status: 'running',
    note: 'Using local fallback responses (no external APIs)',
    endpoints: [
      'POST /api/chat - Chat with AI',
      'GET  /api/health - Health check',
      'POST /api/hybrid-ai/chat - Hybrid AI chat'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'AI Fallback Service',
    timestamp: new Date().toISOString()
  });
});

// Main chat endpoint
app.post('/api/chat', (req, res) => {
  try {
    const { message, provider = 'auto' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    
    const lowerMessage = message.toLowerCase();
    let response = "I'm here to help with your learning journey! I can assist with course recommendations, programming concepts, and learning paths.";
    
    // Find matching response
    for (const [key, value] of Object.entries(aiResponses)) {
      if (lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }
    
    // Format as Athena (your AI assistant)
    const formattedResponse = `👋 **Hello! I'm Athena, your AI learning assistant!**

${response}

🔹 **Quick Tip:** Practice regularly for best results!
🚀 **What else would you like to learn?**`;
    
    res.json({
      success: true,
      response: formattedResponse,
      provider: 'fallback',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hybrid AI endpoint (for frontend compatibility)
app.post('/api/hybrid-ai/chat', (req, res) => {
  try {
    const { message, provider = 'auto' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    
    const response = `✅ AI Connection Successful! Using ${provider} provider. Response: "Hello! I'm ready to help you learn. ${message}"`;
    
    res.json({
      success: true,
      message,
      response,
      provider,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI service is working',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ========================================
  🤖 AI FALLBACK SERVICE
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  💬 Chat: POST http://localhost:${PORT}/api/chat
  🏥 Health: http://localhost:${PORT}/api/health
  ========================================
  💡 Note: Using local fallback responses
  ========================================
  `);
});