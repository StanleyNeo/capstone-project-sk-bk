// s2-backend/routes/aiChat.js
const express = require('express');
const router = express.Router();
const FinalAIService = require('../services/FinalAIService'); // ✅ Use your working service

// Chat endpoint — used by frontend via /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message = '' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid message required' });
    }

    // ✅ Use FINAL AI SERVICE (DeepSeek → Gemini → OpenAI)
    const aiResponse = await FinalAIService.queryAI(message,
      "You are Athena, a helpful AI tutor. Respond concisely and educationally. Mention courses like 'Python Programming' when relevant."
    );

    res.json({
      success: true,
      response: aiResponse,
      provider: 'hybrid',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ aiChat error:', error.message);
    res.json({
      success: true,
      response: `👋 Hello! I'm Athena. Ask me about React, Python, or our courses!`,
      provider: 'fallback'
    });
  }
});

// Stats endpoint — ✅ NOW WORKS
router.get('/stats', (req, res) => {
  try {
    const stats = FinalAIService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;