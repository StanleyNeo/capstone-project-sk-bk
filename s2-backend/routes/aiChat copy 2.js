// s2-backend/routes/aiChat.js
const express = require('express');
const router = express.Router();
const HybridAIService = require('../services/HybridAIService');

router.post('/chat', async (req, res) => {
  try {
    const { message, provider = 'auto' } = req.body;
    
    if (!message) {
      return res.json({ success: false, error: 'No message' });
    }
    
    console.log(`🎯 AI Chat: ${message} (Provider: ${provider})`);
    
    const response = await HybridAIService.getResponse(
      message, 
      'You are a helpful AI tutor for LearnHub. Provide educational responses with markdown formatting.', 
      { provider }
    );
    
    // Generate suggestions based on the message
    const suggestions = generateSuggestions(message);
    
    res.json({
      success: true,
      response: response,
      provider: provider,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.json({
      success: false,
      response: "I'm having trouble connecting to the AI service. Please try again.",
      provider: 'error',
      suggestions: ["Try a different provider", "Test connection", "Ask about courses"]
    });
  }
});

// Helper function to generate suggestions
function generateSuggestions(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('course') || lower.includes('learn')) {
    return [
      "What courses do you have for beginners?",
      "Can you recommend web development courses?",
      "How do I start learning data science?"
    ];
  } else if (lower.includes('react') || lower.includes('javascript')) {
    return [
      "What are React components?",
      "How does React compare to Vue?",
      "What is the virtual DOM?"
    ];
  } else if (lower.includes('python') || lower.includes('programming')) {
    return [
      "What is Python used for?",
      "How long does it take to learn Python?",
      "What are Python libraries?"
    ];
  } else if (lower.includes('data') || lower.includes('science')) {
    return [
      "What is data science?",
      "What skills do data scientists need?",
      "What is machine learning?"
    ];
  }
  
  // Default suggestions
  return [
    "What courses do you have for beginners?",
    "Can you recommend web development courses?",
    "How do I start learning data science?"
  ];
}

// Add statistics endpoint
router.get('/stats', (req, res) => {
  try {
    const stats = HybridAIService.getStatistics();
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Clear cache endpoint
router.post('/clear-cache', (req, res) => {
  try {
    const result = HybridAIService.clearCache();
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;