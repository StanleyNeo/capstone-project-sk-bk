// s2-backend\routes\chatbotRoutes.js
const express = require('express');
const router = express.Router();
const HybridAIService = require('../services/HybridAIService');

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, provider = 'auto', context = '' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`🤖 AI Chat Request: "${message}" (provider: ${provider})`);
    
    // Get AI response from HybridAIService
    const aiResponse = await HybridAIService.getResponse(message, context, { 
      provider 
    });
    
    console.log(`✅ AI Response: "${aiResponse.substring(0, 50)}..."`);
    
    // Generate relevant suggestions
    let suggestions = [];
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('react')) {
      suggestions = [
        "What are React hooks?",
        "React vs Vue comparison",
        "React component lifecycle",
        "React state management"
      ];
    } else if (lowerMsg.includes('python')) {
      suggestions = [
        "Python for web development",
        "Python data science libraries",
        "Python vs JavaScript",
        "Python frameworks"
      ];
    } else if (lowerMsg.includes('data science') || lowerMsg.includes('data scientist')) {
      suggestions = [
        "Data science roadmap",
        "Machine learning basics",
        "Data visualization tools",
        "Statistics for data science"
      ];
    } else if (lowerMsg.includes('course') || lowerMsg.includes('learn')) {
      suggestions = [
        "Web development courses",
        "Data science courses",
        "Python programming courses",
        "AI/ML courses"
      ];
    }
    
    res.json({
      success: true,
      response: aiResponse, // This should be the ACTUAL AI response
      provider: provider,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      success: false,
      response: "I apologize, but I'm having trouble connecting to the AI service. Please try again.",
      type: 'error'
    });
  }
});

// Chat health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'AI Chatbot',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/chatbot/chat': 'Main chat endpoint',
      'GET /api/chatbot/health': 'Health check'
    }
  });
});

// Get conversation starters
router.get('/starters', (req, res) => {
  const starters = [
    "What courses do you have for beginners?",
    "How do I become a web developer?",
    "Explain machine learning in simple terms",
    "Recommend courses for data science",
    "What is React used for?",
    "Tell me about Python programming"
  ];
  
  res.json({
    success: true,
    starters: starters
  });
});

// Chatbot info
router.get('/info', (req, res) => {
  res.json({
    success: true,
    name: "AI Learning Assistant",
    version: "1.0.0",
    capabilities: [
      "Course recommendations",
      "Learning path guidance",
      "Concept explanations",
      "Technical Q&A",
      "Personalized learning advice"
    ],
    backend: "s2-backend (AI Service)",
    port: 5001
  });
});

module.exports = router;