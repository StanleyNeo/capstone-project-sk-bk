require('dotenv').config();
const { OpenAI } = require('openai');
const axios = require('axios');

class FinalAIService {
  constructor() {
    this.providers = {
      deepseek: null,
      google: null,
      openai: null
    };
    
    this.usageStats = {
      deepseek: { success: 0, error: 0 },
      google: { success: 0, error: 0 },
      openai: { success: 0, error: 0 },
      smartmock: { success: 0, error: 0 }
    };
    
    this.responseCache = new Map();
    this.cacheTimeouts = new Map(); // Track cache timeouts
    this.initializeProviders();
  }
  
  initializeProviders() {
    console.log('🚀 Initializing AI Providers...\n');
    
    // 1. DeepSeek (Primary - Free & Reliable)
    if (process.env.DEEPSEEK_API_KEY) {
      const key = process.env.DEEPSEEK_API_KEY.trim();
      if (key && key.startsWith('sk-')) {
        this.providers.deepseek = {
          apiKey: key,
          endpoint: 'https://api.deepseek.com/chat/completions'
        };
        console.log('✅ DeepSeek AI: READY (Primary - Free Tier)');
      } else {
        console.warn('⚠️ DeepSeek key format appears invalid');
      }
    } else {
      console.warn('⚠️ DEEPSEEK_API_KEY not set');
    }
    
    // 2. Google Gemini (Secondary)
    if (process.env.GOOGLE_AI_API_KEY) {
      const key = process.env.GOOGLE_AI_API_KEY.trim();
      if (key && key.length > 30) {
        this.providers.google = {
          apiKey: key,
          endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
        };
        console.log('✅ Google Gemini: READY (Secondary)');
      } else {
        console.warn('⚠️ Google AI key appears invalid (too short)');
      }
    } else {
      console.warn('⚠️ GOOGLE_AI_API_KEY not set');
    }
    
    // 3. OpenAI (Tertiary - may have quota issues)
    if (process.env.OPENAI_API_KEY) {
      const key = process.env.OPENAI_API_KEY.trim();
      if (key && key.startsWith('sk-')) {
        this.providers.openai = new OpenAI({
          apiKey: key,
          timeout: 10000
        });
        console.log('⚠️ OpenAI: READY (Tertiary - may have quota limits)');
      } else {
        console.warn('⚠️ OpenAI key format appears incorrect');
      }
    } else {
      console.warn('⚠️ OPENAI_API_KEY not set');
    }
    
    console.log('\n📊 Provider Status:');
    console.log(`  1. ${this.providers.deepseek ? '✅' : '❌'} DeepSeek`);
    console.log(`  2. ${this.providers.google ? '✅' : '❌'} Google Gemini`);
    console.log(`  3. ${this.providers.openai ? '✅' : '❌'} OpenAI`);
    console.log('\n🎯 Using priority: DeepSeek → Google → OpenAI → Smart Mock\n');
  }
  
  async queryAI(prompt, context = '') {
    // Generate better cache key
    const cacheKey = `ai_${Buffer.from(prompt + context).toString('base64').substring(0, 50)}`;
    
    // Check cache first
    if (this.responseCache.has(cacheKey)) {
      console.log('💾 Using cached response');
      return this.responseCache.get(cacheKey);
    }
    
    console.log(`\n🤖 AI Query: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`);
    
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    const systemPrompt = "You are Athena, a helpful and enthusiastic AI tutor for an online learning platform. Provide clear, educational, and encouraging responses. Use markdown formatting for readability.";
    
    // Provider priority based on reliability
    const providersToTry = [
      { name: 'deepseek', func: () => this.queryDeepSeek(fullPrompt, systemPrompt) },
      { name: 'google', func: () => this.queryGoogleGemini(fullPrompt, systemPrompt) },
      { name: 'openai', func: () => this.queryOpenAI(fullPrompt, systemPrompt) }
    ];
    
    for (const provider of providersToTry) {
      if (this.providers[provider.name]) {
        try {
          console.log(`🔄 Trying ${provider.name.toUpperCase()}...`);
          const response = await provider.func();
          
          this.usageStats[provider.name].success++;
          console.log(`✅ ${provider.name.toUpperCase()} SUCCESS`);
          
          // Cache successful response (5 minute TTL)
          this.responseCache.set(cacheKey, response);
          
          // Clear existing timeout if any
          if (this.cacheTimeouts.has(cacheKey)) {
            clearTimeout(this.cacheTimeouts.get(cacheKey));
          }
          
          // Set new timeout
          const timeoutId = setTimeout(() => {
            this.responseCache.delete(cacheKey);
            this.cacheTimeouts.delete(cacheKey);
          }, 5 * 60 * 1000);
          
          this.cacheTimeouts.set(cacheKey, timeoutId);
          
          return response;
          
        } catch (error) {
          this.usageStats[provider.name].error++;
          
          // Special handling for quota errors
          if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('402')) {
            console.log(`❌ ${provider.name.toUpperCase()} quota exceeded`);
          } else {
            console.log(`❌ ${provider.name.toUpperCase()} failed: ${error.message.substring(0, 100)}`);
          }
          
          // Wait briefly before trying next provider
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    



    
    // All providers failed, use smart mock
    console.log('🎭 Using Smart Mock AI');
    this.usageStats.smartmock.success++;
    return this.getSmartMockResponse(prompt);
  }
  
  async queryDeepSeek(prompt, systemPrompt) {
    if (!this.providers.deepseek) {
      throw new Error('DeepSeek not configured');
    }
    
    const response = await axios.post(
      this.providers.deepseek.endpoint,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${this.providers.deepseek.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000
      }
    );
    
    // Check response structure
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      console.error('DeepSeek unexpected response:', JSON.stringify(response.data, null, 2));
      throw new Error('Unexpected DeepSeek response structure');
    }
  }
  
  async queryGoogleGemini(prompt, systemPrompt) {
    if (!this.providers.google) {
      throw new Error('Google AI not configured');
    }
    
    const response = await axios.post(
      `${this.providers.google.endpoint}?key=${this.providers.google.apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\n${prompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
          maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
          topP: 0.8,
          topK: 40
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000
      }
    );
    
    // Check response structure
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0]) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini unexpected response:', JSON.stringify(response.data, null, 2));
      throw new Error('Unexpected Gemini response structure');
    }
  }
  
  async queryOpenAI(prompt, systemPrompt) {
    if (!this.providers.openai) {
      throw new Error('OpenAI not configured');
    }
    
    try {
      const completion = await this.providers.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
      });
      
      if (completion.choices && completion.choices[0] && completion.choices[0].message) {
        return completion.choices[0].message.content;
      } else {
        throw new Error('Unexpected OpenAI response structure');
      }
      
    } catch (error) {
      // Handle specific OpenAI errors
      if (error.message.includes('quota') || error.message.includes('429')) {
        throw new Error('OpenAI quota exceeded. Please check your billing.');
      }
      throw error;
    }
  }
  
  getSmartMockResponse(prompt) {
    const lower = prompt.toLowerCase();
    
    // Enhanced responses with formatting
    const responses = {
      // React/JavaScript queries
      react: `**React.js - Your Questions Answered!** 🚀

🔹 **What is React?**  
React is a JavaScript library for building user interfaces, maintained by Meta (formerly Facebook). It's component-based and declarative.

🔹 **Key Features:**
• **Components**: Reusable UI building blocks
• **JSX**: HTML-like syntax in JavaScript  
• **Virtual DOM**: Efficient updates
• **Hooks**: State management in functions
• **React Router**: Navigation handling

🔹 **Perfect For:**
✅ Single Page Applications (SPAs)
✅ Interactive dashboards  
✅ Reusable component libraries
✅ Progressive Web Apps

💡 **Learning Path:**  
1. JavaScript fundamentals → 2. ES6+ features → 3. React basics → 4. State management → 5. Advanced patterns

🎯 **Our Courses:** "React for Beginners", "Advanced React Patterns", "Full-Stack React Development"`,

      python: `**Python Programming Guide** 🐍

🔹 **Why Python?**
• Beginner-friendly syntax
• Versatile (Web, Data, AI, Automation)
• Massive community & libraries
• High demand in job market

🔹 **Career Paths:**
1. **Web Development**: Django, Flask
2. **Data Science**: Pandas, NumPy, Scikit-learn  
3. **Machine Learning**: TensorFlow, PyTorch
4. **Automation & Scripting**: Task automation

🔹 **Getting Started:**
\`\`\`python
# Your first Python program
print("Hello, World!")

# Simple calculator
def add(a, b):
    return a + b
\`\`\`

📚 **Start with**: "Python Basics" → "Data Analysis" → "Web Development" track`,

      courses: `**Course Recommendations Based on Your Goals** 📚

🎯 **For Complete Beginners:**
1. **Web Dev Fundamentals** (4 weeks)
   • HTML, CSS, JavaScript basics
   • Build your first website
   
2. **Python for Everyone** (6 weeks)  
   • Variables to functions
   • Mini projects included

🎯 **Career Changers:**
1. **Full Stack Web Development** (12 weeks)
   • Frontend + Backend
   • Portfolio-ready projects
   
2. **Data Science Bootcamp** (16 weeks)
   • Python, SQL, Statistics
   • Real-world datasets

🎯 **Skill Upgraders:**
1. **React & Modern Frontend** (8 weeks)
   • Hooks, Context, Redux
   • Performance optimization
   
2. **Cloud & DevOps** (10 weeks)
   • Docker, Kubernetes, AWS
   • CI/CD pipelines

💬 **Tell me:** What's your main goal? (Career change, promotion, hobby, etc.)`,

      default: `👋 **Hello! I'm Athena, your AI Learning Assistant!** 

I'm here to help you:
✅ **Find perfect courses** for your goals
✅ **Explain complex concepts** simply
✅ **Create learning paths** step-by-step
✅ **Answer any questions** about tech

🔹 **Try asking me:**
• "How do I start with programming?"
• "Explain machine learning simply"
• "What's better: React or Vue?"
• "Recommend courses for data science"

🔹 **Quick Learning Tips:**
1. Start with fundamentals before frameworks
2. Build projects to reinforce learning  
3. Join study groups for accountability
4. Practice consistently (30min/day > 5hrs/weekend)

🚀 **What would you like to learn today?**`
    };
    
    // Smart keyword matching
    if (lower.includes('react') || lower.includes('javascript') || lower.includes('frontend')) {
      return responses.react;
    } else if (lower.includes('python') || lower.includes('data science') || lower.includes('machine learning')) {
      return responses.python;
    } else if (lower.includes('course') || lower.includes('recommend') || lower.includes('learn')) {
      return responses.courses;
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `👋 **Welcome to LearnHub!** 

I'm Athena, your AI learning companion! Whether you're just starting out or leveling up your skills, I'm here to guide you.

**Popular Starting Points:**
• "I want to learn web development"
• "How to become a data scientist?"  
• "Best programming language for beginners?"
• "Explain [any concept] simply"

**What's your learning goal today?** 🎯`;
    } else {
      return responses.default;
    }
  }
  
  getStats() {
    const totalRequests = Object.values(this.usageStats).reduce(
      (total, stat) => total + (stat.success || 0) + (stat.error || 0), 0
    );
    
    const successRate = totalRequests > 0 
      ? Math.round((Object.values(this.usageStats).reduce(
          (total, stat) => total + (stat.success || 0), 0
        ) / totalRequests) * 100)
      : 0;
    
    return {
      success: true,
      stats: {
        ...this.usageStats,
        totalRequests,
        successRate: `${successRate}%`,
        cacheSize: this.responseCache.size,
        cacheTimeouts: this.cacheTimeouts.size
      },
      providers: {
        deepseek: !!this.providers.deepseek,
        google: !!this.providers.google,
        openai: !!this.providers.openai
      },
      config: {
        primary: process.env.PRIMARY_AI_PROVIDER,
        timeout: process.env.REQUEST_TIMEOUT,
        maxTokens: process.env.AI_MAX_TOKENS
      },
      timestamp: new Date().toISOString()
    };
  }
  
  clearCache() {
    const cacheSize = this.responseCache.size;
    const timeoutSize = this.cacheTimeouts.size;
    
    // Clear all timeouts
    this.cacheTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    
    // Clear maps
    this.responseCache.clear();
    this.cacheTimeouts.clear();
    
    return { 
      cleared: true, 
      cacheItemsCleared: cacheSize,
      timeoutsCleared: timeoutSize
    };
  }
}

module.exports = new FinalAIService();