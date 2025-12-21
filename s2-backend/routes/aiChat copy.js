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
    
    console.log(`🎯 AI Chat: ${message}`);
    
    const response = await HybridAIService.getResponse(message, 'You are a helpful AI tutor.', { provider });
    
    res.json({
      success: true,
      response: response,
      provider: provider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.json({
      success: false,
      response: "Error: " + error.message
    });
  }
});

module.exports = router;