const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5001;
require('dotenv').config();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Configuration
const config = {
  providers: {
    deepseek: {
      url: 'https://api.deepseek.com/chat/completions',
      key: process.env.DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      enabled: true
    },
    gemini: {
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      key: process.env.GOOGLE_AI_API_KEY,
      enabled: true
    },
    openai: {
      url: 'https://api.openai.com/v1/chat/completions',
      key: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      enabled: true
    }
  },
  fallbackEnabled: true,
  timeout: 15000
};

// Simple fallback responses
const fallbackResponses = {
  'react': 'React is a JavaScript library for building user interfaces. It allows you to create reusable UI components.',
  'data scientist': 'To become a data scientist: 1) Learn Python/R, 2) Study statistics, 3) Master data visualization, 4) Learn machine learning, 5) Build projects.',
  'courses': 'We offer courses in Web Development, Data Science, AI/ML, Python, React, and more. Try searching for specific topics!',
  'web development': 'Web development includes HTML, CSS, JavaScript, and frameworks. We have beginner to advanced courses.',
  'machine learning': 'Machine learning is a subset of AI. Start with Python, then learn libraries like scikit-learn and TensorFlow.',
  'python': 'Python is great for beginners and data science. It has simple syntax and powerful libraries.',
  'javascript': 'JavaScript is essential for web development. It runs in browsers and on servers (Node.js).',
  'html': 'HTML is the structure of web pages. It defines headings, paragraphs, links, and images.',
  'css': 'CSS styles HTML elements. It controls colors, layouts, and responsiveness.'
};

// ========== ✅ HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  const status = {
    deepseek: config.providers.deepseek.key ? 'configured' : 'missing',
    gemini: config.providers.gemini.key ? 'configured' : 'missing',
    openai: config.providers.openai.key ? 'configured' : 'missing',
    fallback: 'enabled'
  };
  
  res.json({
    success: true,
    status: 'running',
    providers: status,
    timestamp: new Date().toISOString()
  });
});

// ========== ✅ CHAT ENDPOINT ==========
app.post('/api/chat', async (req, res) => {
  try {
    const { message, provider = 'auto' } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    console.log(`🤖 Processing: "${message.substring(0, 50)}..."`);
    
    // Try providers in order
    let response;
    let usedProvider = 'fallback';
    
    // Try DeepSeek first (most reliable free tier)
    if (config.providers.deepseek.enabled && config.providers.deepseek.key) {
      try {
        response = await queryDeepSeek(message);
        usedProvider = 'deepseek';
        console.log(`✅ DeepSeek success`);
      } catch (error) {
        console.log(`❌ DeepSeek failed: ${error.message}`);
      }
    }
    
    // Try Gemini if DeepSeek failed
    if (!response && config.providers.gemini.enabled && config.providers.gemini.key) {
      try {
        response = await queryGemini(message);
        usedProvider = 'gemini';
        console.log(`✅ Gemini success`);
      } catch (error) {
        console.log(`❌ Gemini failed: ${error.message}`);
      }
    }
    
    // Try OpenAI if others failed
    if (!response && config.providers.openai.enabled && config.providers.openai.key) {
      try {
        response = await queryOpenAI(message);
        usedProvider = 'openai';
        console.log(`✅ OpenAI success`);
      } catch (error) {
        console.log(`❌ OpenAI failed: ${error.message}`);
      }
    }
    
    // Use fallback if all providers fail
    if (!response && config.fallbackEnabled) {
      response = getFallbackResponse(message);
      usedProvider = 'fallback';
      console.log(`🎯 Using fallback response`);
    }
    
    if (!response) {
      return res.status(503).json({
        success: false,
        error: 'All AI providers are unavailable'
      });
    }
    
    res.json({
      success: true,
      message,
      response,
      provider: usedProvider,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      fallback: getFallbackResponse(req.body.message || '')
    });
  }
});

// ========== ✅ PROVIDER FUNCTIONS ==========
async function queryDeepSeek(message) {
  const response = await axios.post(
    config.providers.deepseek.url,
    {
      model: config.providers.deepseek.model,
      messages: [
        {
          role: 'system',
          content: 'You are Athena, an AI tutor for LearnHub. Provide clear, educational, and encouraging responses. Use markdown formatting for readability.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${config.providers.deepseek.key}`,
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    }
  );
  
  return response.data.choices[0].message.content;
}

async function queryGemini(message) {
  const response = await axios.post(
    `${config.providers.gemini.url}?key=${config.providers.gemini.key}`,
    {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are Athena, an AI tutor for LearnHub.
              Provide clear, educational, and encouraging responses.
              Use markdown formatting for readability.
              
              ${message}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.8,
        topK: 40
      }
    },
    {
      timeout: config.timeout
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
}

async function queryOpenAI(message) {
  const response = await axios.post(
    config.providers.openai.url,
    {
      model: config.providers.openai.model,
      messages: [
        {
          role: 'system',
          content: 'You are Athena, an AI tutor for LearnHub. Provide clear, educational, and encouraging responses. Use markdown formatting for readability.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${config.providers.openai.key}`,
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    }
  );
  
  return response.data.choices[0].message.content;
}

function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords
  for (const [keyword, response] of Object.entries(fallbackResponses)) {
    if (lowerMessage.includes(keyword)) {
      return `**Athena AI Assistant:**\n\n${response}\n\n*Note: Using fallback response. For full AI features, configure API keys.*`;
    }
  }
  
  // Default response
  return `**Athena AI Assistant:**\n\nI'm here to help with your learning journey! I can assist with:\n• Course recommendations\n• Programming concepts\n• Learning paths\n• Study strategies\n\nTry asking about specific topics like React, Python, or Data Science!\n\n*Note: Using fallback mode. Configure API keys for enhanced AI responses.*`;
}

// ========== ✅ HYBRID AI ENDPOINT (for compatibility) ==========
app.post('/api/hybrid-ai/chat', async (req, res) => {
  try {
    const { message, provider = 'auto' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    
    const chatResponse = await queryDeepSeek(message).catch(async () => {
      return await queryGemini(message).catch(async () => {
        return await queryOpenAI(message).catch(() => {
          return getFallbackResponse(message);
        });
      });
    });
    
    res.json({
      success: true,
      message,
      response: chatResponse,
      provider: 'hybrid',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fallback: getFallbackResponse(req.body.message || '')
    });
  }
});

// ========== ✅ TEST ENDPOINT ==========
app.get('/api/test', async (req, res) => {
  const tests = [];
  
  // Test DeepSeek
  if (config.providers.deepseek.key) {
    try {
      const testMsg = 'Say "Hello" if working';
      const response = await axios.post(
        config.providers.deepseek.url,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: testMsg }],
          max_tokens: 10
        },
        {
          headers: { 'Authorization': `Bearer ${config.providers.deepseek.key}` },
          timeout: 5000
        }
      );
      tests.push({ provider: 'DeepSeek', status: '✅ Working' });
    } catch (error) {
      tests.push({ provider: 'DeepSeek', status: '❌ Failed', error: error.message });
    }
  }
  
  res.json({
    success: true,
    tests,
    config: {
      deepseek: config.providers.deepseek.key ? 'Configured' : 'Missing',
      gemini: config.providers.gemini.key ? 'Configured' : 'Missing',
      openai: config.providers.openai.key ? 'Configured' : 'Missing'
    }
  });
});

// ========== ✅ START SERVER ==========
app.listen(PORT, () => {
  console.log(`
  ========================================
  🤖 AI BACKEND (FIXED VERSION)
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  
  🔑 API Key Status:
  ${config.providers.deepseek.key ? '  ✅ DeepSeek: Configured' : '  ❌ DeepSeek: Missing'}
  ${config.providers.gemini.key ? '  ✅ Gemini: Configured' : '  ❌ Gemini: Missing'}
  ${config.providers.openai.key ? '  ✅ OpenAI: Configured' : '  ❌ OpenAI: Missing'}
  
  💬 Chat: POST http://localhost:${PORT}/api/chat
  🏥 Health: http://localhost:${PORT}/api/health
  🧪 Test: http://localhost:${PORT}/api/test
  ========================================
  `);
  
  // Check which providers are working
  console.log('🔍 Testing provider connectivity...');
  
  setTimeout(async () => {
    if (config.providers.deepseek.key) {
      try {
        await axios.get('https://api.deepseek.com', { timeout: 3000 });
        console.log('🌐 DeepSeek API: Reachable');
      } catch (error) {
        console.log('🌐 DeepSeek API: Unreachable or key invalid');
      }
    }
  }, 1000);
});