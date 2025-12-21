// s2-backend/services/HybridAIService.js
class HybridAIService {
  static async getResponse(message, context = '', options = {}) {
    // ✅ Always return a valid string response — no undefined!
    const msg = (message || '').toLowerCase().trim();

    // Smart keyword-based responses
    if (msg.includes('react')) {
      return "React is a JavaScript library for building user interfaces. It uses components and a virtual DOM for efficient updates. Try our *React for Beginners* course!";
    }
    if (msg.includes('python')) {
      return "Python is beginner-friendly and powerful. Our *Python Programming* course (7 weeks) covers basics to advanced concepts like APIs and data structures.";
    }
    if (msg.includes('data science') || msg.includes('data scientist')) {
      return "Start with *Data Science with Python* — it covers pandas, NumPy, matplotlib, and introduces machine learning with real datasets.";
    }
    if (msg.includes('web development') || msg.includes('web dev')) {
      return "*Web Development Fundamentals* teaches HTML, CSS, and JavaScript in 6 weeks. You'll build 3 real projects by the end!";
    }
    if (msg.includes('ai') || msg.includes('machine learning') || msg.includes('ml')) {
      return "*Machine Learning Fundamentals* introduces algorithms, neural networks, and hands-on projects using scikit-learn and TensorFlow.";
    }
    if (msg.includes('course') || msg.includes('learn') || msg.includes('recommend')) {
      return "We offer courses in Web Development, Data Science, AI/ML, and Programming. Try searching for a topic like 'React' or 'Python'!";
    }
    if (msg.includes('hello') || msg.includes('hi ') || msg === 'hi') {
      return "👋 Hello! I'm Athena, your AI learning assistant. How can I help you today?";
    }

    // Default helpful response
    return `👋 Hello! I'm Athena, your AI learning assistant.
I can help with:
• Course recommendations (e.g., "Find Python courses")
• Concept explanations (e.g., "What is React?")
• Learning path advice (e.g., "How do I become a data scientist?")

Try asking: "What courses do you have for beginners?"`;
  }
}

module.exports = HybridAIService;