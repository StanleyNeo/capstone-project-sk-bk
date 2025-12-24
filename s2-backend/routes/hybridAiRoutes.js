// In s2-backend/routes/hybridAIRoutes.js or similar
const express = require('express');
const router = express.Router();
const HybridAIService = require('../services/HybridAIService');

// POST /api/hybrid-ai/chat - Get AI response
router.post('/chat', async (req, res) => {
  try {
    const { message, provider = 'auto', context = '' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`🤖 AI Request: "${message}" (provider: ${provider})`);
    
    // Get ACTUAL AI response (not test message!)
    const aiResponse = await HybridAIService.getResponse(message, context, { 
      provider 
    });
    
    console.log(`✅ AI Response (first 100 chars): "${aiResponse.substring(0, 100)}..."`);
    
    // Generate relevant suggestions
    let suggestions = [];
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('react')) {
      suggestions = [
        "What are React hooks?",
        "React vs Vue comparison",
        "React component lifecycle"
      ];
    } else if (lowerMsg.includes('python')) {
      suggestions = [
        "Python for web development",
        "Python data science libraries",
        "Python vs JavaScript"
      ];
    } else if (lowerMsg.includes('data science')) {
      suggestions = [
        "Data science roadmap",
        "Machine learning basics",
        "Statistics for data science"
      ];
    } else if (lowerMsg.includes('course')) {
      suggestions = [
        "Web development courses",
        "Data science courses",
        "Python programming courses"
      ];
    } else {
      suggestions = [
        "What courses do you have?",
        "How do I become a web developer?",
        "Explain machine learning"
      ];
    }
    
    // Return ACTUAL AI response, not test message!
    res.json({
      success: true,
      response: aiResponse, // This is the ACTUAL AI response
      provider: provider,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Chat error:', error);
    res.status(500).json({
      success: false,
      response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      type: 'error'
    });
  }
});

module.exports = router;