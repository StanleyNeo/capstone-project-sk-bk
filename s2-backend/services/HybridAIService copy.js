require('dotenv').config();
const { OpenAI } = require('openai');
const axios = require('axios');

class HybridAIService {
  constructor() {
    console.log('🚀 Initializing Hybrid AI Service with 3 Providers...');
    
    this.providers = {
      openai: null,
      gemini: null,
      deepseek: null
    };
    
    this.initializeProviders();
    this.setupCache();
    this.setupStatistics();
    
    // Provider priority (configurable)
    this.providerPriority = this.getProviderPriority();
    
    console.log('\n📊 Provider Status:');
    Object.entries(this.providers).forEach(([name, provider]) => {
      console.log(`  ${provider ? '✅' : '❌'} ${name.toUpperCase()}: ${provider ? 'Ready' : 'Not Configured'}`);
    });
    
    console.log(`\n🎯 Priority Order: ${this.providerPriority.join(' → ')}`);
  }
  
  initializeProviders() {
    // 1. Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        this.providers.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000
        });
      } catch (error) {
        console.warn(`⚠️ OpenAI initialization failed: ${error.message}`);
      }
    }
    
    // 2. Initialize Google Gemini
    if (process.env.GOOGLE_AI_API_KEY) {
      this.providers.gemini = {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      };
    }
    
    // 3. Initialize DeepSeek
    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.deepseek = {
        apiKey: process.env.DEEPSEEK_API_KEY,
        endpoint: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-chat'
      };
    }
  }
  
  getProviderPriority() {
    // Use configured priority or default based on cost/free tier
    if (process.env.PROVIDER_PRIORITY) {
      const priority = process.env.PROVIDER_PRIORITY.split(',').map(p => p.trim());
      return priority.filter(p => this.providers[p]); // Filter only available providers
    }
    
    // Default priority: Free/cheap first
    const available = Object.keys(this.providers).filter(p => this.providers[p]);
    
    if (process.env.USE_FREE_FIRST === 'true') {
      // Prioritize free providers: Gemini (free tier) > DeepSeek (free tier) > OpenAI (paid)
      const freeFirst = ['gemini', 'deepseek', 'openai'];
      return freeFirst.filter(p => available.includes(p));
    }
    
    // Quality first: OpenAI > Gemini > DeepSeek
    const qualityFirst = ['openai', 'gemini', 'deepseek'];
    return qualityFirst.filter(p => available.includes(p));
  }
  
  setupCache() {
    this.cache = new Map();
    this.cacheTimeouts = new Map();
    this.cacheDuration = parseInt(process.env.CACHE_DURATION) || 300000;
  }
  
  setupStatistics() {
    this.stats = {
      requests: { total: 0, successful: 0, failed: 0 },
      providers: {
        openai: { calls: 0, success: 0, errors: 0, totalTokens: 0 },
        gemini: { calls: 0, success: 0, errors: 0, totalTokens: 0 },
        deepseek: { calls: 0, success: 0, errors: 0, totalTokens: 0 }
      },
      cache: { hits: 0, misses: 0, size: 0 },
      responseTimes: { openai: [], gemini: [], deepseek: [] },
      fallbacks: 0
    };
  }
  
  async getResponse(prompt, context = '', options = {}) {
  this.stats.requests.total++;
  
  const startTime = Date.now();
  const cacheKey = this.generateCacheKey(prompt, context, options);
  
  // Check cache first
  if (process.env.ENABLE_CACHE === 'true') {
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cache.hits++;
      console.log(`💾 Cache hit for: "${prompt.substring(0, 40)}..."`);
      return cached; // Should return cached RESPONSE, not test message
    }
    this.stats.cache.misses++;
  }
  
  console.log(`🤖 AI Processing: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`);
  
  // Try providers in priority order
  for (const providerName of this.providerPriority) {
    if (!this.providers[providerName]) continue;
    
    try {
      console.log(`🔄 Trying ${providerName.toUpperCase()}...`);
      const providerStart = Date.now();
      
      // This should return the ACTUAL AI response
      const response = await this.queryProvider(providerName, prompt, context, options);
      const providerTime = Date.now() - providerStart;
      
      // Update statistics
      this.stats.providers[providerName].calls++;
      this.stats.providers[providerName].success++;
      this.stats.providers[providerName].totalTokens += response.length / 4;
      this.stats.responseTimes[providerName].push(providerTime);
      
      this.stats.requests.successful++;
      
      console.log(`✅ ${providerName.toUpperCase()} success (${providerTime}ms): ${response.substring(0, 40)}...`);
      
      // Cache the ACTUAL response
      if (process.env.ENABLE_CACHE === 'true') {
        this.addToCache(cacheKey, response);
      }
      
      return response; // Return ACTUAL AI response
      
    } catch (error) {
      // Update error statistics
      this.stats.providers[providerName].calls++;
      this.stats.providers[providerName].errors++;
      
      console.log(`❌ ${providerName.toUpperCase()} failed: ${error.message.substring(0, 80)}`);
      
      // Wait briefly before trying next provider
      await this.delay(500);
    }
  }
  
  // All providers failed - use fallback
  this.stats.requests.failed++;
  this.stats.fallbacks++;
  
  console.log('🎭 All providers failed, using intelligent fallback');
  const fallbackResponse = this.getIntelligentFallback(prompt);
  
  // Cache fallback response
  if (process.env.ENABLE_CACHE === 'true') {
    this.addToCache(cacheKey, fallbackResponse, 60000);
  }
  
// At the end of getResponse() in HybridAIService.js
if (!response || response.trim() === '') {
  // 🔁 Fallback to local knowledge base
  const fallbacks = {
    'react': 'React is a JavaScript library for building user interfaces. Try our "React for Beginners" course!',
    'python': 'Python is great for beginners. Start with "Python Programming" course.',
    'data science': 'Our "Data Science with Python" course covers pandas, NumPy, and visualization.',
    'web development': 'Begin with "Web Development Fundamentals" (HTML, CSS, JavaScript).',
    'ai': 'Take "Machine Learning Fundamentals" to learn AI concepts step by step.'
  };
  
  const lowerMsg = message.toLowerCase();
  for (const [key, response] of Object.entries(fallbacks)) {
    if (lowerMsg.includes(key)) {
      return response;
    }
  }
  return `I found these courses: Web Development, Python, Data Science, and AI/ML. Try searching for one!`;
}

  return fallbackResponse; // Return fallback response
}
  
async queryProvider(providerName, prompt, context, options = {}) {
  const systemPrompt = context || `You are Athena, an AI tutor for LearnHub.
  Provide clear, educational, and encouraging responses.
  Use markdown formatting for readability.`;
  
  // Ensure options has default values
  const safeOptions = {
    temperature: parseFloat(options.temperature || process.env.AI_TEMPERATURE || 0.7),
    maxTokens: parseInt(options.maxTokens || process.env.AI_MAX_TOKENS || 500),
    model: options.model || this.getDefaultModel(providerName),
    ...options
  };
  
  switch (providerName) {
    case 'openai':
      return await this.queryOpenAI(prompt, systemPrompt, safeOptions);
    case 'gemini':
      return await this.queryGemini(prompt, systemPrompt, safeOptions);
    case 'deepseek':
      return await this.queryDeepSeek(prompt, systemPrompt, safeOptions);
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

// Add this helper method
getDefaultModel(providerName) {
  const defaults = {
    openai: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    gemini: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    deepseek: 'deepseek-chat'
  };
  return defaults[providerName];
}
  
async queryOpenAI(prompt, systemPrompt, options) {
  const completion = await this.providers.openai.chat.completions.create({
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: options.temperature,
    max_tokens: options.maxTokens,
  });
  
  return completion.choices[0].message.content;
}

async queryGemini(prompt, systemPrompt, options) {
  const fullPrompt = `${systemPrompt}\n\n${prompt}`;
  
  const response = await axios.post(
    `${this.providers.gemini.endpoint}?key=${this.providers.gemini.apiKey}`,
    {
      contents: [{
        role: "user",
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
        topP: 0.8,
        topK: 40
      }
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
}
  
  async queryGemini(prompt, systemPrompt, options) {
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const response = await axios.post(
      `${this.providers.gemini.endpoint}?key=${this.providers.gemini.apiKey}`,
      {
        contents: [{
          role: "user",
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: parseFloat(options.temperature || process.env.AI_TEMPERATURE || 0.7),
          maxOutputTokens: parseInt(options.maxTokens || process.env.AI_MAX_TOKENS || 500),
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  }
  
  async queryDeepSeek(prompt, systemPrompt, options) {
    try {
      console.log(`🤖 DeepSeek API Key: ${this.providers.deepseek.apiKey.substring(0, 10)}...`);
      
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions', // Updated endpoint
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.deepseek.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw new Error(`DeepSeek API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  // Cache management methods
  generateCacheKey(prompt, context, options) {
    const data = `${prompt}-${context}-${JSON.stringify(options)}`;
    return Buffer.from(data).toString('base64').substring(0, 50);
  }
  
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheDuration) {
      return cached.response;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(key);
      if (this.cacheTimeouts.has(key)) {
        clearTimeout(this.cacheTimeouts.get(key));
        this.cacheTimeouts.delete(key);
      }
    }
    
    return null;
  }
  
  addToCache(key, response, customDuration = null) {
    const duration = customDuration || this.cacheDuration;
    
    this.cache.set(key, {
      response: response,
      timestamp: Date.now(),
      provider: 'cached'
    });
    
    // Set timeout to clear cache
    const timeoutId = setTimeout(() => {
      this.cache.delete(key);
      this.cacheTimeouts.delete(key);
    }, duration);
    
    this.cacheTimeouts.set(key, timeoutId);
    this.stats.cache.size = this.cache.size;
  }
  
  // Intelligent fallback responses (same as before, but enhanced)
getIntelligentFallback(prompt) {
  const lower = prompt.toLowerCase();
  
  // Return ACTUAL AI responses for common questions
  if (lower.includes('react')) {
    return `React is a JavaScript library for building user interfaces. It was developed by Facebook and is widely used for creating single-page applications and mobile apps.\n\nKey Features:\n• Component-based architecture\n• Virtual DOM for performance\n• JSX syntax\n• Unidirectional data flow\n• Rich ecosystem\n\nPerfect for: Building modern web applications, dashboards, and reusable UI components.`;
  } else if (lower.includes('python')) {
    return `Python is a high-level, interpreted programming language known for its simplicity and readability.\n\nWhy Python is Popular:\n• Easy to learn for beginners\n• Versatile (web dev, data science, AI, automation)\n• Large standard library\n• Strong community support\n• Cross-platform compatibility\n\nCommon Uses: Web development (Django/Flask), Data analysis (Pandas), Machine Learning (TensorFlow), and Automation scripts.`;
  } else if (lower.includes('data science') || lower.includes('data scientist')) {
    return `To become a data scientist:\n\n1. Learn Python programming fundamentals\n2. Master data analysis with Pandas and NumPy\n3. Study statistics and probability\n4. Learn data visualization (Matplotlib, Seaborn)\n5. Explore machine learning basics\n6. Work on real projects (Kaggle)\n7. Build a portfolio\n\nRecommended Courses: "Python Programming", "Data Science with Python", "Machine Learning Fundamentals"`;
  } else if (lower.includes('course') || lower.includes('learn')) {
    return `We offer various courses:\n\n• Web Development: HTML/CSS, JavaScript, React\n• Data Science: Python, Data Analysis, Machine Learning\n• Programming: Python, Java, C++\n• AI/ML: Machine Learning, Deep Learning, NLP\n\nWhich area interests you most?`;
  } else {
    // For general questions, provide helpful response
    return `I'm your AI Learning Assistant! I can help you with:\n\n• Course recommendations\n• Learning paths and career guidance\n• Programming concepts\n• Study tips and resources\n\nTry asking about specific topics like React, Python, or data science courses!`;
  }
}
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Statistics and monitoring
  getStatistics() {
    const totalCalls = Object.values(this.stats.providers).reduce((sum, p) => sum + p.calls, 0);
    const successfulCalls = Object.values(this.stats.providers).reduce((sum, p) => sum + p.success, 0);
    
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls * 100).toFixed(2) : 0;
    const cacheHitRate = (this.stats.cache.hits + this.stats.cache.misses) > 0 
      ? (this.stats.cache.hits / (this.stats.cache.hits + this.stats.cache.misses) * 100).toFixed(2)
      : 0;
    
    // Calculate average response times
    const avgResponseTimes = {};
    Object.keys(this.stats.responseTimes).forEach(provider => {
      const times = this.stats.responseTimes[provider];
      avgResponseTimes[provider] = times.length > 0 
        ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)
        : 0;
    });
    
    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      configuration: {
        primaryProvider: process.env.PRIMARY_PROVIDER,
        providerPriority: this.providerPriority,
        cacheEnabled: process.env.ENABLE_CACHE === 'true',
        freeFirst: process.env.USE_FREE_FIRST === 'true'
      },
      availability: {
        openai: !!this.providers.openai,
        gemini: !!this.providers.gemini,
        deepseek: !!this.providers.deepseek
      },
      statistics: {
        requests: this.stats.requests,
        providers: this.stats.providers,
        cache: {
          ...this.stats.cache,
          hitRate: `${cacheHitRate}%`
        },
        successRate: `${successRate}%`,
        averageResponseTimes: avgResponseTimes,
        fallbacks: this.stats.fallbacks
      },
      cacheInfo: {
        size: this.cache.size,
        duration: `${this.cacheDuration / 1000}s`,
        timeouts: this.cacheTimeouts.size
      }
    };
  }
  
  // Provider switching methods
  setProviderPriority(newPriority) {
    const validProviders = newPriority.filter(p => this.providers[p]);
    if (validProviders.length > 0) {
      this.providerPriority = validProviders;
      console.log(`🔄 Provider priority updated: ${this.providerPriority.join(' → ')}`);
      return true;
    }
    return false;
  }
  
  getAvailableProviders() {
    return Object.keys(this.providers).filter(p => this.providers[p]);
  }
  
  disableProvider(providerName) {
    if (this.providers[providerName]) {
      this.providerPriority = this.providerPriority.filter(p => p !== providerName);
      console.log(`⏸️  Provider ${providerName} disabled from rotation`);
      return true;
    }
    return false;
  }
  
  enableProvider(providerName) {
    if (this.providers[providerName] && !this.providerPriority.includes(providerName)) {
      this.providerPriority.push(providerName);
      console.log(`▶️  Provider ${providerName} added to rotation`);
      return true;
    }
    return false;
  }
  
  clearCache() {
    const previousSize = this.cache.size;
    
    // Clear all timeouts
    this.cacheTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    
    // Clear maps
    this.cache.clear();
    this.cacheTimeouts.clear();
    
    console.log(`🧹 Cache cleared (${previousSize} items removed)`);
    return { cleared: true, itemsRemoved: previousSize };
  }
}

// Export singleton instance
module.exports = new HybridAIService();