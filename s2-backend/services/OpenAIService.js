require('dotenv').config();
const { OpenAI } = require('openai');

class OpenAIService {
  constructor() {
    console.log('🤖 Initializing OpenAI Service for LearnHub...');
    
    // Initialize OpenAI client
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000 // 30 second timeout
      });
      this.isAvailable = true;
      console.log(`✅ OpenAI GPT-3.5 Turbo service ready.`);
    } else {
      this.openai = null;
      this.isAvailable = false;
      console.log('⚠️ OpenAI API key not configured. Using smart fallback responses.');
    }
    
    // Simple in-memory cache to avoid duplicate API calls
    this.responseCache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // Cache for 5 minutes
    
    // Statistics tracking
    this.stats = {
      totalRequests: 0,
      openAISuccess: 0,
      fallbackUsed: 0,
      cacheHits: 0
    };
  }
  
  /**
   * Main method to get AI response
   */
  async getResponse(prompt, context = '') {
    this.stats.totalRequests++;
    
    // Create a cache key from prompt and context
    const cacheKey = `${prompt}-${context}`.slice(0, 100);
    
    // Check cache first
    const cached = this.responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheDuration) {
      this.stats.cacheHits++;
      console.log(`💾 Serving from cache: "${prompt.substring(0, 40)}..."`);
      return cached.response;
    }
    
    console.log(`🔍 Processing: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`);
    
    // Try OpenAI first if available
    if (this.isAvailable && this.openai) {
      try {
        const aiResponse = await this.callOpenAI(prompt, context);
        this.stats.openAISuccess++;
        
        // Cache the successful response
        this.responseCache.set(cacheKey, {
          response: aiResponse,
          timestamp: Date.now()
        });
        
        console.log(`✅ OpenAI response successful (${aiResponse.length} chars)`);
        return aiResponse;
        
      } catch (error) {
        console.error(`❌ OpenAI API error: ${error.message}`);
        // Fall through to fallback response
      }
    }
    
    // Use intelligent fallback response
    this.stats.fallbackUsed++;
    console.log(`🎯 Using intelligent fallback response`);
    return this.getIntelligentFallback(prompt);
  }
  
  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt, context = '') {
    const systemMessage = context || `You are Athena, an AI tutor for LearnHub, an online learning platform.
    Your role: Provide clear, educational, and encouraging responses to students.
    Guidelines:
    1. Be helpful and patient
    2. Explain concepts simply
    3. Recommend relevant courses when appropriate
    4. Use markdown for formatting (headings, bullet points, bold)
    5. Keep responses concise but informative`;
    
    const completion = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
    });
    
    return completion.choices[0].message.content;
  }
  
  /**
   * Intelligent fallback responses for when OpenAI is unavailable
   */
  getIntelligentFallback(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Smart pattern matching with detailed educational responses
    if (lowerPrompt.includes('react') || lowerPrompt.includes('javascript') || lowerPrompt.includes('frontend')) {
      return `**React.js Learning Guide** 🚀

React is a JavaScript library for building user interfaces with reusable components.

📚 **Core Concepts to Learn:**
• **Components** - Building blocks of React apps
• **JSX** - HTML-like syntax in JavaScript
• **State & Props** - Managing data flow
• **Hooks** - Modern way to use state and effects
• **React Router** - Navigation between views

💡 **Learning Path:**
1. Master JavaScript fundamentals
2. Learn ES6+ features (arrow functions, destructuring)
3. Understand React basics (components, props, state)
4. Practice with small projects
5. Explore advanced patterns (context, redux)

🎯 **Our Recommendation:** Start with "React for Beginners" course which includes 3 hands-on projects!`;
      
    } else if (lowerPrompt.includes('python') || lowerPrompt.includes('data science') || lowerPrompt.includes('machine learning')) {
      return `**Python Programming Pathway** 🐍

Python is a versatile language perfect for beginners and professionals alike.

🔹 **Key Application Areas:**
• **Web Development** - Django, Flask frameworks
• **Data Science** - Pandas, NumPy, Matplotlib
• **Machine Learning** - TensorFlow, scikit-learn
• **Automation** - Scripting and task automation

🔹 **Why Start with Python?**
✅ Easy to read and write syntax
✅ Massive community support
✅ Extensive library ecosystem
✅ High demand in job market

🔹 **First Steps:**
\`\`\`python
# Simple Python example
def welcome_student(name):
    return f"Welcome {name}! Ready to learn Python?"

print(welcome_student("Student"))
\`\`\`

📚 **Suggested Path:** "Python Basics" → "Data Analysis" → "Web Development"`;
      
    } else if (lowerPrompt.includes('course') || lowerPrompt.includes('recommend') || lowerPrompt.includes('learn')) {
      return `**Personalized Course Recommendations** 📋

Based on popular career paths and student success stories:

🎯 **For Absolute Beginners:**
**1. Web Development Fundamentals** (4 weeks)
   • HTML, CSS, JavaScript basics
   • Build a personal portfolio website
   
**2. Python for Everyone** (6 weeks)
   • Programming basics to intermediate concepts
   • 5 mini-projects included
   
**3. UI/UX Design Principles** (5 weeks)
   • User-centered design thinking
   • Create wireframes and prototypes

🎯 **For Career Advancement:**
**1. Full Stack Development** (12 weeks)
   • Frontend (React) + Backend (Node.js)
   • Capstone project: Build a complete web app
   
**2. Data Science Bootcamp** (16 weeks)
   • Python, SQL, Statistics, Machine Learning
   • Work with real-world datasets
   
**3. Cloud & DevOps Engineering** (10 weeks)
   • Docker, Kubernetes, AWS basics
   • CI/CD pipeline implementation

💬 **To help you better:** What specific area are you most interested in exploring?`;
      
    } else if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      return `👋 **Hello! I'm Athena, your AI learning assistant for LearnHub!**

I'm here to support your learning journey in several ways:

✅ **Course Guidance** - Find the right learning path
✅ **Concept Explanations** - Understand complex topics simply  
✅ **Learning Strategies** - Effective study techniques
✅ **Project Ideas** - Practical applications of your skills

**Try asking me things like:**
• "How do I start learning to code?"
• "What's the difference between frontend and backend?"
• "Can you explain APIs simply?"
• "What courses match my interest in design?"

**Quick Tip:** Consistency beats intensity! Regular 30-minute study sessions are more effective than occasional long ones.

🚀 **What would you like to learn or explore today?**`;
      
    } else {
      // General helpful response for other queries
      return `I'd love to help you with your learning journey! To give you the most useful guidance:

1. **What's your primary goal?** (e.g., career change, skill upgrade, personal project)
2. **What's your current experience level?** (beginner, intermediate, advanced)
3. **How much time can you commit weekly?** (e.g., 5 hours, 10 hours, 20 hours)

This information helps me tailor recommendations specifically for your situation! 

In the meantime, you might explore:
• **Web Development** - Build websites and applications
• **Data Science** - Analyze data and create insights  
• **Design** - Create beautiful user experiences
• **Business & Marketing** - Grow products and reach audiences

What area sparks your curiosity? ✨`;
    }
  }
  
  /**
   * Get service statistics
   */
  getStats() {
    const successRate = this.stats.totalRequests > 0 
      ? Math.round((this.stats.openAISuccess / this.stats.totalRequests) * 100)
      : 0;
    
    return {
      service: 'OpenAI GPT-3.5 Turbo',
      availability: this.isAvailable ? 'Available' : 'Not Configured',
      statistics: {
        ...this.stats,
        openAISuccessRate: `${successRate}%`,
        cacheSize: this.responseCache.size,
        cacheHitRate: this.stats.totalRequests > 0 
          ? `${Math.round((this.stats.cacheHits / this.stats.totalRequests) * 100)}%`
          : '0%'
      },
      configuration: {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: process.env.AI_MAX_TOKENS || 500,
        temperature: process.env.AI_TEMPERATURE || 0.7
      },
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Clear the response cache
   */
  clearCache() {
    const previousSize = this.responseCache.size;
    this.responseCache.clear();
    return {
      action: 'cache_cleared',
      itemsRemoved: previousSize,
      timestamp: new Date().toISOString()
    };
  }
}

// Export a singleton instance
module.exports = new OpenAIService();