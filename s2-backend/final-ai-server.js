const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

// Load routes
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

// ========== ✅ ROUTE REGISTRATION (ORDER MATTERS!) ==========
app.use('/api/chatbot', chatbotRoutes);        // /api/chatbot/chat, /health
app.use('/api/ai', recommendationRoutes);      // ✅ FIRST: /api/ai/recommend, /courses
app.use('/api/ai', require('./routes/aiChat')); // NOW uses FinalAIService too
app.use('/api/hybrid-ai', hybridAIRoutes);     // /api/hybrid-ai/* (fallback if needed)

// ========== ✅ AI SERVICES ==========
const FinalAIService = require('./services/FinalAIService');

// ========== ✅ API ENDPOINTS ==========

// 1. ROOT
app.get('/', (req, res) => {
  res.json({
    message: '🤖 AI Backend Service',
    version: '3.2.0',
    status: 'running',
    endpoints: [
      'POST /api/chat - Simple chat',
      'POST /api/hybrid-ai/chat - Full AI chat (uses FinalAIService)',
      'POST /api/ai/recommend - Course recommendations',
      'GET  /api/ai/stats - AI usage statistics',
      'GET  /api/health - Health check'
    ]
  });
});

// 2. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'AI Backend',
    timestamp: new Date().toISOString()
  });
});

// 3. TEST ENDPOINT
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI backend is operational.',
    timestamp: new Date().toISOString()
  });
});

// 4. SIMPLE CHAT (fallback-safe)
app.post('/api/chat', (req, res) => {
  try {
    const { message = '' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid message required' });
    }
    const responses = {
      react: 'React is a JavaScript library for building UIs with reusable components.',
      python: 'Python is beginner-friendly and powerful. Start with our *Python Programming* course.',
      'web dev': '*Web Development Fundamentals* teaches HTML, CSS, and JavaScript in 6 weeks.',
      default: '👋 Hello! I\'m Athena. Ask me about courses, React, Python, or data science!'
    };
    const lower = message.toLowerCase();
    let response = responses.default;
    if (lower.includes('react')) response = responses.react;
    else if (lower.includes('python')) response = responses.python;
    else if (lower.includes('web') || lower.includes('html') || lower.includes('css')) response = responses['web dev'];

    res.json({
      success: true,
      message,
      response,
      provider: 'simple-fallback',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. ✅ REAL AI CHAT (uses FinalAIService.js with DeepSeek/Gemini/OpenAI)
app.post('/api/hybrid-ai/chat', async (req, res) => {
  try {
    const { message = '', provider = 'auto' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid message required' });
    }

    // ✅ Use your working FinalAIService (DeepSeek → Gemini → OpenAI → smart fallback)
    const aiResponse = await FinalAIService.queryAI(message, 
      "You are Athena, a supportive AI learning assistant for an LMS. Respond in 1-3 short paragraphs. Be educational, encouraging, and practical. Mention specific courses like 'Python Programming' or 'Web Development Fundamentals' when relevant.");

    res.json({
      success: true,
      message,
      response: aiResponse,
      provider: provider || 'hybrid',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Hybrid-AI chat error:', error.message);
    // Always return a valid response (never undefined)
    res.json({
      success: true,
      response: `👋 Hello! I'm Athena, your AI learning assistant.
I can help with course recommendations, concept explanations, and learning paths.
Try asking: "What is React?" or "Recommend a beginner Python course."`,
      provider: 'fallback',
      error: error.message
    });
  }
});

// 6. ✅ AI STATISTICS ENDPOINT (FIXES "getStatistics is not a function" ERROR)
app.get('/api/ai/stats', (req, res) => {
  try {
    const stats = FinalAIService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ AI Stats error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI stats',
      providers: {
        deepseek: !!process.env.DEEPSEEK_API_KEY,
        google: !!process.env.GOOGLE_AI_API_KEY,
        openai: !!process.env.OPENAI_API_KEY
      },
      note: 'Check FinalAIService.js implementation'
    });
  }
});

app.get('/api/ai/ping', (req, res) => {
  res.json({
    success: true,
    message: 'AI Service is operational',
    timestamp: new Date().toISOString(),
    providers: {
      deepseek: !!process.env.DEEPSEEK_API_KEY,
      gemini: !!process.env.GOOGLE_AI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    }
  });
});

// ========== ✅ START SERVER ==========
app.listen(PORT, () => {
  console.log(`
  ========================================
  🤖 AI BACKEND SERVICE (v3.2 - FULLY PATCHED)
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  💬 Chat: POST /api/chat (simple)
  🤖 Hybrid: POST /api/hybrid-ai/chat (DeepSeek+)
  📊 Stats: GET /api/ai/stats (✅ FIXED)
  🎯 Recomm: POST /api/ai/recommend
  🏥 Health: GET /api/health
  ========================================
  `);
});