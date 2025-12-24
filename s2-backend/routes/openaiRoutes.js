const express = require('express');
const router = express.Router();
const OpenAIService = require('../services/OpenAIService');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'LearnHub AI Tutor',
    provider: 'OpenAI GPT-3.5 Turbo',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Main chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid message'
      });
    }
    
    // Get AI response
    const aiResponse = await OpenAIService.getResponse(message.trim(), context);
    
    // Return successful response
    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to process your request',
      fallbackResponse: "Hello! I'm here to help with your learning journey. What would you like to learn about today?",
      timestamp: new Date().toISOString()
    });
  }
});

// Get service statistics
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    ...OpenAIService.getStats()
  });
});

// Clear cache (admin endpoint)
router.post('/clear-cache', (req, res) => {
  const result = OpenAIService.clearCache();
  res.json({
    success: true,
    message: 'Response cache cleared successfully',
    ...result
  });
});

// Test endpoint - quick verification
router.get('/test', async (req, res) => {
  try {
    const testResponse = await OpenAIService.getResponse(
      'Say "LearnHub AI is operational" in a creative way',
      'You are a test assistant confirming system status.'
    );
    
    res.json({
      success: true,
      message: 'AI service test completed',
      testResponse: testResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

module.exports = router;