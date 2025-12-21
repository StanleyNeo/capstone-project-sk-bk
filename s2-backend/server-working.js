const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5001;
require('dotenv').config();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Get API keys from environment
const API_KEYS = {
  gemini: process.env.GOOGLE_AI_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
  openai: process.env.OPENAI_API_KEY
};

// Check which keys are configured
const configuredProviders = Object.entries(API_KEYS)
  .filter(([_, key]) => key && key.trim() !== '')
  .map(([provider]) => provider);

console.log('🔑 Configured Providers:', configuredProviders);

// ========== ✅ HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    providers: configuredProviders,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
    
    console.log(`🤖 Processing: "${message.substring(0, 100)}..."`);
    
    let response;
    let usedProvider = 'fallback';
    
    // Try providers in order of reliability
    // 1. Try DeepSeek first (most reliable free)
    if (API_KEYS.deepseek) {
      try {
        response = await tryDeepSeek(message);
        usedProvider = 'deepseek';
        console.log('✅ DeepSeek: Success');
      } catch (error) {
        console.log('❌ DeepSeek failed:', error.message);
      }
    }
    
    // 2. Try Gemini if DeepSeek failed
    if (!response && API_KEYS.gemini) {
      try {
        response = await tryGemini(message);
        usedProvider = 'gemini';
        console.log('✅ Gemini: Success');
      } catch (error) {
        console.log('❌ Gemini failed:', error.message);
      }
    }
    
    // 3. Try OpenAI if others failed
    if (!response && API_KEYS.openai) {
      try {
        response = await tryOpenAI(message);
        usedProvider = 'openai';
        console.log('✅ OpenAI: Success');
      } catch (error) {
        console.log('❌ OpenAI failed:', error.message);
      }
    }
    
    // 4. Use fallback if all failed
    if (!response) {
      response = getFallbackResponse(message);
      usedProvider = 'fallback';
      console.log('🎯 Using fallback response');
    }
    
    // Format as Athena response
    const formattedResponse = formatAsAthena(response);
    
    res.json({
      success: true,
      message,
      response: formattedResponse,
      provider: usedProvider,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error.message);
    const fallback = getFallbackResponse(req.body?.message || '');
    res.json({
      success: true,
      message: req.body?.message,
      response: formatAsAthena(fallback),
      provider: 'fallback',
      timestamp: new Date().toISOString(),
      note: 'Using fallback due to error'
    });
  }
});

// ========== ✅ PROVIDER FUNCTIONS ==========
async function tryDeepSeek(message) {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.deepseek.com/chat/completions',
      headers: {
        'Authorization': `Bearer ${API_KEYS.deepseek}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are Athena, an AI learning assistant for LearnHub LMS. Provide clear, educational, and encouraging responses about courses, programming, and learning. Use markdown formatting for readability. Keep responses concise and helpful.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      timeout: 10000
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error(`DeepSeek: ${error.response?.status || error.code}`);
  }
}

async function tryGemini(message) {
  try {
    const response = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEYS.gemini}`,
      data: {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are Athena, an AI learning assistant for LearnHub LMS. Provide helpful, educational responses about courses and learning. Use markdown for readability.

User question: ${message}`
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
      timeout: 10000
    });
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`Gemini: ${error.response?.status || error.code}`);
  }
}

async function tryOpenAI(message) {
  try {
    // Fix OpenAI key format if it starts with "sk-proj-"
    let apiKey = API_KEYS.openai;
    if (apiKey.startsWith('sk-proj-')) {
      // Remove the "sk-proj-" prefix if present
      apiKey = apiKey.replace('sk-proj-', 'sk-');
    }
    
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are Athena, an AI learning assistant. Provide helpful, educational responses about courses, programming, and learning.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      timeout: 10000
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error(`OpenAI: ${error.response?.status || error.code}`);
  }
}

function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('react')) {
    return "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage application state efficiently. Key features include: virtual DOM, component-based architecture, and one-way data binding.";
  } else if (lowerMsg.includes('data scientist')) {
    return "To become a data scientist:\n1. Learn Python/R programming\n2. Master statistics and mathematics\n3. Study data visualization tools\n4. Learn machine learning algorithms\n5. Practice with real datasets\n6. Build portfolio projects";
  } else if (lowerMsg.includes('course')) {
    return "We offer courses in:\n• Web Development (HTML, CSS, JavaScript)\n• Data Science (Python, Pandas, ML)\n• AI/Machine Learning\n• Mobile Development\n• Cloud Computing\nUse the search feature to find specific courses!";
  } else if (lowerMsg.includes('web')) {
    return "Web development involves building websites and web applications. It includes:\n• Frontend (HTML, CSS, JavaScript)\n• Backend (Node.js, Python, databases)\n• Full-stack (both frontend and backend)";
  } else {
    return "I'm Athena, your AI learning assistant! I can help with:\n• Course recommendations\n• Programming concepts\n• Learning paths\n• Study strategies\n\nTry asking about specific topics like React, Python, Data Science, or Web Development!";
  }
}

function formatAsAthena(response) {
  return `👋 **Hello! I'm Athena, your AI learning assistant!**

${response}

🔹 **Quick Tip:** Practice regularly and build projects!
🚀 **What would you like to learn next?**`;
}

// ========== ✅ HYBRID AI ENDPOINT (for frontend compatibility) ==========
app.post('/api/hybrid-ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    let response;
    let provider = 'auto';
    
    // Try DeepSeek first
    if (API_KEYS.deepseek) {
      try {
        response = await tryDeepSeek(message);
        provider = 'deepseek';
      } catch (error) {
        console.log('DeepSeek failed:', error.message);
      }
    }
    
    // Then Gemini
    if (!response && API_KEYS.gemini) {
      try {
        response = await tryGemini(message);
        provider = 'gemini';
      } catch (error) {
        console.log('Gemini failed:', error.message);
      }
    }
    
    // Then OpenAI
    if (!response && API_KEYS.openai) {
      try {
        response = await tryOpenAI(message);
        provider = 'openai';
      } catch (error) {
        console.log('OpenAI failed:', error.message);
      }
    }
    
    // Fallback
    if (!response) {
      response = getFallbackResponse(message);
      provider = 'fallback';
    }
    
    res.json({
      success: true,
      message,
      response: formatAsAthena(response),
      provider,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hybrid AI error:', error.message);
    res.json({
      success: true,
      message: req.body?.message,
      response: formatAsAthena(getFallbackResponse(req.body?.message || '')),
      provider: 'fallback',
      timestamp: new Date().toISOString()
    });
  }
});

// ========== ✅ TEST ENDPOINT ==========
app.get('/api/test', async (req, res) => {
  const tests = [];
  
  // Test DeepSeek
  if (API_KEYS.deepseek) {
    try {
      await axios.get('https://api.deepseek.com', { timeout: 3000 });
      tests.push({ provider: 'DeepSeek', status: '✅ Reachable', key: 'Configured' });
    } catch (error) {
      tests.push({ provider: 'DeepSeek', status: '❌ Unreachable', key: 'Configured' });
    }
  } else {
    tests.push({ provider: 'DeepSeek', status: '❌ Not configured', key: 'Missing' });
  }
  
  // Test Gemini
  if (API_KEYS.gemini) {
    tests.push({ provider: 'Gemini', status: '✅ Configured', key: 'Present' });
  } else {
    tests.push({ provider: 'Gemini', status: '❌ Not configured', key: 'Missing' });
  }
  
  // Test OpenAI
  if (API_KEYS.openai) {
    // Check OpenAI key format
    const key = API_KEYS.openai;
    const isValidFormat = key.startsWith('sk-');
    tests.push({ 
      provider: 'OpenAI', 
      status: isValidFormat ? '✅ Valid format' : '⚠️ Unusual format (sk-proj-)', 
      key: 'Configured' 
    });
  } else {
    tests.push({ provider: 'OpenAI', status: '❌ Not configured', key: 'Missing' });
  }
  
  res.json({
    success: true,
    tests,
    timestamp: new Date().toISOString(),
    note: 'Connection tests show if APIs are reachable. Actual functionality may vary.'
  });
});

// ========== ✅ START SERVER ==========
app.listen(PORT, () => {
  console.log(`
  ========================================
  🤖 AI BACKEND (ALL 3 PROVIDERS)
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  
  🔑 API Key Status:
  ${API_KEYS.deepseek ? '  ✅ DeepSeek: Configured' : '  ❌ DeepSeek: Missing'}
  ${API_KEYS.gemini ? '  ✅ Gemini: Configured' : '  ❌ Gemini: Missing'}
  ${API_KEYS.openai ? '  ✅ OpenAI: Configured' : '  ❌ OpenAI: Missing'}
  
  🔄 Provider Order: DeepSeek → Gemini → OpenAI → Fallback
  
  💬 Chat: POST http://localhost:${PORT}/api/chat
  🤖 Hybrid: POST http://localhost:${PORT}/api/hybrid-ai/chat
  🏥 Health: http://localhost:${PORT}/api/health
  🧪 Test: http://localhost:${PORT}/api/test
  ========================================
  `);
});