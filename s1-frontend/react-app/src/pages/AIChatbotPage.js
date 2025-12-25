import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import '../components/AIChatbot.css';

const AI_BACKEND_URL = process.env.REACT_APP_AI_BACKEND_URL || 'http://localhost:5001';

const AIChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarters, setConversationStarters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHints, setSearchHints] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userId] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [aiProvider, setAiProvider] = useState('auto');
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initial greeting
  const initialMessages = [
    {
      id: 1,
      text: "Hello! I'm your AI Learning Assistant. I can help you find courses, explain concepts, and guide your learning journey. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'greeting',
      provider: 'ai'
    }
  ];

  // Initialize
  useEffect(() => {
    setMessages(initialMessages);
    fetchConversationStarters();
    loadChatHistory();
    fetchSearchHints();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, searchResults]);

  // Fetch conversation starters
  const fetchConversationStarters = async () => {
    try {
      setConversationStarters([
        "What courses do you have?",
        "Explain web development",
        "How do I become a data scientist?",
        "Recommend beginner courses",
        "What is React?",
        "Tell me about Python programming",
        "Help me with machine learning",
        "Search for JavaScript courses",
        "Find data science courses"
      ]);
    } catch (error) {
      console.error('Failed to fetch starters:', error);
    }
  };

  // Fetch search hints from courses
  const fetchSearchHints = async () => {
    try {
      const coursesResponse = await ApiService.getCoursesFromAnalytics();
      if (coursesResponse.success && Array.isArray(coursesResponse.data)) {
        const hints = coursesResponse.data
          .map(course => course.title)
          .slice(0, 5);
        setSearchHints(hints);
      }
    } catch (error) {
      console.error('Failed to fetch search hints:', error);
    }
  };

  // Perform search
  const performSearch = async (query) => {
    try {
      console.log('🔍 Searching for:', query);
      
      const searchResponse = await ApiService.searchCourses(query);
      console.log('Search response:', searchResponse);
      
      if (searchResponse.success && Array.isArray(searchResponse.results)) {
        setSearchResults(searchResponse.results.slice(0, 5));
        
        const formattedResults = searchResponse.results.map((course, index) => ({
          id: course._id || index,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          instructor: course.instructor,
          rating: course.rating,
          enrolledStudents: course.enrolledStudents
        }));
        
        return formattedResults;
      } else {
        const coursesResponse = await ApiService.getCoursesFromAnalytics();
        if (coursesResponse.success && Array.isArray(coursesResponse.data)) {
          const courses = coursesResponse.data;
          const filtered = courses.filter(course => 
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase()) ||
            course.category.toLowerCase().includes(query.toLowerCase())
          );
          
          setSearchResults(filtered.slice(0, 5));
          return filtered.slice(0, 5);
        }
      }
      return [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const savedHistory = localStorage.getItem(`chat_history_${userId}`);
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setChatHistory(history.slice(-10));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // Save chat message
  const saveChatMessage = async (message, response, provider) => {
    try {
      const chatEntry = {
        userId,
        message,
        response,
        provider,
        timestamp: new Date().toISOString()
      };
      
      const existing = JSON.parse(localStorage.getItem(`chat_history_${userId}`) || '[]');
      existing.push(chatEntry);
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(existing.slice(-50)));
      
      setChatHistory(prev => [...prev, chatEntry].slice(-10));
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

  // Enhanced send message
  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      provider: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSearchResults([]);

    // Check if message contains search keywords
    const isSearchQuery = messageText.toLowerCase().includes('search') || 
                         messageText.toLowerCase().includes('find') ||
                         messageText.toLowerCase().includes('look for') ||
                         messageText.toLowerCase().includes('course about') ||
                         messageText.toLowerCase().includes('courses for') ||
                         messageText.toLowerCase().includes('learn');

    try {
      if (isSearchQuery) {
        const searchQuery = messageText.replace(/search|find|look for|courses? for|learn|about/gi, '').trim();
        const searchResults = await performSearch(searchQuery || messageText);
        const aiResponse = await sendToAI(messageText, searchResults);
        
        const botMessage = {
          id: Date.now() + 1,
          text: aiResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          type: 'ai_response',
          provider: aiResponse.provider || 'ai',
          suggestions: aiResponse.suggestions || [],
          hasSearchResults: searchResults.length > 0
        };

        setMessages(prev => [...prev, botMessage]);
        saveChatMessage(messageText, aiResponse.text, aiResponse.provider || 'ai');
        
      } else {
        const aiResponse = await sendToAI(messageText);
        
        const botMessage = {
          id: Date.now() + 1,
          text: aiResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          type: 'ai_response',
          provider: aiResponse.provider || 'ai',
          suggestions: aiResponse.suggestions || []
        };

        setMessages(prev => [...prev, botMessage]);
        saveChatMessage(messageText, aiResponse.text, aiResponse.provider || 'ai');
      }
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting to the chatbot service. Please make sure the MongoDB backend is running on port 5000.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'error',
        provider: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to AI backend
  const sendToAI = async (messageText, searchResults = []) => {
    try {
      console.log(`📤 Sending to AI Backend: ${messageText} (provider: ${aiProvider})`);
      
      const response = await fetch(`${AI_BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: messageText,
          provider: aiProvider,
          context: {
            userName: 'User',
            userLevel: 'beginner',
            interests: []
          }
        })
      });

      console.log('📡 AI Backend response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Raw API Response:', data);
      
      if (data.success) {
        if (data.response.includes("Hello! I'm ready to help you learn")) {
          console.log('⚠️ Got generic greeting, using fallback instead');
          return {
            text: generateSpecificResponse(messageText),
            provider: data.provider || 'ai',
            suggestions: data.suggestions || generateFollowUpQuestions(messageText, searchResults),
            data: data.data || null
          };
        }
        
        return {
          text: data.response,
          provider: data.provider || 'ai',
          suggestions: data.suggestions || generateFollowUpQuestions(messageText, searchResults),
          data: data.data || null
        };
      } else {
        throw new Error(data.error || 'AI chat failed');
      }
    } catch (error) {
      console.error('❌ AI call error:', error);
      return {
        text: generateSpecificResponse(messageText),
        provider: 'error',
        suggestions: generateFollowUpQuestions(messageText, searchResults)
      };
    }
  };

  // Generate specific response
  const generateSpecificResponse = (query) => {
    const lower = query.toLowerCase();
    if (lower.includes('react')) {
      return "React is a JavaScript library for building user interfaces, developed by Facebook. It uses a component-based architecture and virtual DOM for efficient updates. Would you like to know more about React hooks or components?";
    }
    if (lower.includes('python')) {
      return "Python is a versatile programming language used for web development, data science, AI, and automation. It's known for its simple syntax and large ecosystem. Are you interested in Python for web development or data science?";
    }
    if (lower.includes('data science')) {
      return "Data science involves analyzing data to extract insights. It combines statistics, programming, and domain knowledge. The typical path includes learning Python, statistics, machine learning, and data visualization. Would you like course recommendations?";
    }
    return "I can help you with learning topics, course recommendations, and career guidance. What specific topic would you like to learn about?";
  };

  // Generate follow-up questions
  const generateFollowUpQuestions = (query, searchResults = []) => {
    const questions = [];
    
    if (searchResults.length > 0) {
      questions.push(
        `Tell me more about ${searchResults[0]?.title || 'this course'}`,
        `What are the prerequisites for ${searchResults[0]?.title || 'this course'}?`,
        `How do I enroll in ${searchResults[0]?.title || 'this course'}?`,
        `What skills will I learn from ${searchResults[0]?.title || 'this course'}?`
      );
    } else {
      questions.push(
        "What courses do you have for beginners?",
        "Can you recommend web development courses?",
        "How do I start learning data science?",
        "What programming language should I learn first?"
      );
    }
    
    return questions.slice(0, 3);
  };

  // Test AI connection
  const testAIConnection = async () => {
    setIsLoading(true);
    try {
      const testMessage = {
        id: Date.now(),
        text: "Testing AI connection...",
        sender: 'bot',
        timestamp: new Date(),
        type: 'test'
      };
      setMessages(prev => [...prev, testMessage]);

      const response = await fetch(`${AI_BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Hello, are you working? Say yes if you are.',
          provider: aiProvider 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const successMessage = {
          id: Date.now() + 1,
          text: `✅ AI Connection Successful! Using ${data.provider || 'unknown'} provider.\nResponse: "${data.response}"`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'success',
          provider: data.provider || 'ai'
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error('AI test failed');
      }
    } catch (error) {
      console.error('Test failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ AI Connection Failed. Please check backend logs.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick starter click
  const handleStarterClick = (starter) => {
    setInput(starter);
    setTimeout(() => {
      sendMessage(starter);
    }, 100);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages(initialMessages);
    setSearchResults([]);
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Change AI provider
  const changeProvider = (provider) => {
    setAiProvider(provider);
    const providerMessage = {
      id: Date.now(),
      text: `Switched to ${provider.toUpperCase()} AI provider`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'info'
    };
    setMessages(prev => [...prev, providerMessage]);
  };

  // Render message
  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';
    
    return (
      <div className={`message-container ${isBot ? 'bot-message' : 'user-message'}`} key={message.id}>
        <div className="message-header">
          <div className="message-sender">
            {isBot ? (
              <>
                <span className="bot-icon">🤖</span>
                <span className="sender-name">
                  AI Assistant {message.provider && message.provider !== 'ai' && `• ${message.provider.toUpperCase()}`}
                </span>
              </>
            ) : (
              <>
                <span className="user-icon">👤</span>
                <span className="sender-name">You</span>
              </>
            )}
          </div>
          <div className="message-time">{formatTime(new Date(message.timestamp))}</div>
        </div>
        
        <div className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
          <div className="message-text">
            {message.text.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < message.text.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Suggestions for bot messages */}
        {isBot && message.suggestions && message.suggestions.length > 0 && (
          <div className="message-suggestions">
            <small className="suggestions-label">Quick follow-ups:</small>
            <div className="suggestions-buttons">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleStarterClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render search results
  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;

    return (
      <div className="search-results-section">
        <div className="search-results-header">
          <h5 className="search-results-title">🔍 Search Results ({searchResults.length})</h5>
          <small className="text-muted">Courses matching your query</small>
        </div>
        
        <div className="search-results-grid">
          {searchResults.map((result, index) => (
            <div className="search-result-card" key={index}>
              <div className="search-result-header">
                <h6 className="search-result-title">{result.title}</h6>
                <span className="search-result-badge">{result.category}</span>
              </div>
              <p className="search-result-description">{result.description}</p>
              <div className="search-result-footer">
                <div className="search-result-meta">
                  <span className="search-result-meta-item">
                    <i className="fas fa-user"></i> {result.instructor}
                  </span>
                  <span className="search-result-meta-item">
                    <i className="fas fa-graduation-cap"></i> {result.level}
                  </span>
                  {result.rating && (
                    <span className="search-result-meta-item">
                      <i className="fas fa-star"></i> {result.rating}
                    </span>
                  )}
                  {result.enrolledStudents > 0 && (
                    <span className="search-result-meta-item">
                      <i className="fas fa-users"></i> {result.enrolledStudents}
                    </span>
                  )}
                </div>
                <button 
                  className="search-result-action-btn"
                  onClick={() => handleStarterClick(`Tell me more about ${result.title}`)}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render search hints
  const renderSearchHints = () => {
    if (searchHints.length === 0) return null;

    return (
      <div className="search-hints-section">
        <h5 className="search-hints-title">💡 Search for courses about:</h5>
        <div className="search-hints-grid">
          {searchHints.map((hint, index) => (
            <button
              key={index}
              className="search-hint-card"
              onClick={() => handleStarterClick(`Find courses about ${hint}`)}
              disabled={isLoading}
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-chatbot-page">
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="chat-header-full">
          <div className="container">
            <div className="d-flex align-items-center justify-content-between py-3">
              <div className="d-flex align-items-center">
                <div className="chat-avatar-large me-3">
                  <span className="avatar-icon-large">🤖</span>
                </div>
                <div>
                  <h1 className="h3 mb-1 text-white">AI Learning Assistant</h1>
                  <p className="mb-0 text-white-50">
                    Connected to Port 5001 • Provider: {aiProvider.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <select 
                  value={aiProvider}
                  onChange={(e) => changeProvider(e.target.value)}
                  className="form-select form-select-sm bg-dark text-white border-dark"
                  disabled={isLoading}
                  style={{ width: '140px' }}
                >
                  <option value="auto">🤖 Auto (Smart)</option>
                  <option value="openai">⚡ OpenAI</option>
                  <option value="gemini">🔮 Gemini</option>
                  <option value="deepseek">🌊 DeepSeek</option>
                </select>
                <button 
                  className="btn btn-sm btn-outline-light"
                  onClick={testAIConnection}
                  disabled={isLoading}
                  title="Test AI Connection"
                >
                  <i className="fas fa-bolt me-1"></i> Test
                </button>
                <button 
                  className="btn btn-sm btn-outline-light"
                  onClick={clearConversation}
                  disabled={isLoading}
                  title="Clear conversation"
                >
                  <i className="fas fa-trash me-1"></i> Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid py-4">
          <div className="row">
            {/* Left Panel - Chat Interface */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg h-100">
                <div className="card-body p-0 d-flex flex-column">
                  {/* Chat Body */}
                  <div 
                    className="chat-body-full flex-grow-1 p-4"
                    ref={chatContainerRef}
                    style={{ height: '500px', overflowY: 'auto' }}
                  >
                    {/* Welcome Message */}
                    <div className="welcome-section">
                      <div className="welcome-card">
                        <div className="welcome-icon">👋</div>
                        <h4 className="welcome-title">How can I help you today?</h4>
                        <p className="welcome-text">
                          I'm connected to the AI backend on port 5001. Ask me about courses, programming, or learning advice!
                        </p>
                        <div className="welcome-actions">
                          <small className="text-muted">
                            Current provider: <strong>{aiProvider.toUpperCase()}</strong>
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Search Hints */}
                    {renderSearchHints()}

                    {/* Conversation Starters */}
                    {conversationStarters.length > 0 && (
                      <div className="starters-section">
                        <h5 className="starters-title">💡 Try asking:</h5>
                        <div className="starters-grid">
                          {conversationStarters.map((starter, index) => (
                            <button
                              key={index}
                              className="starter-card"
                              onClick={() => handleStarterClick(starter)}
                              disabled={isLoading}
                            >
                              {starter}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="messages-container">
                      {messages.map(renderMessage)}
                      
                      {/* Search Results */}
                      {renderSearchResults()}
                      
                      {isLoading && (
                        <div className="typing-indicator">
                          <div className="typing-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                          </div>
                          <span className="typing-text">
                            AI is thinking... Using {aiProvider.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Chat Footer */}
                  <div className="chat-footer-full p-4 border-top">
                    <div className="input-container">
                      <div className="input-wrapper">
                        <textarea
                          className="chat-input"
                          placeholder={`Ask me anything or search for courses...`}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isLoading}
                          rows="2"
                        />
                        <div className="input-actions">
                          <button
                            className="send-btn"
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            title="Send message"
                          >
                            {isLoading ? (
                              <span className="spinner"></span>
                            ) : (
                              <span className="send-icon">➤</span>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="input-hints mt-2">
                        <small className="hint-text">
                          Press <kbd>Enter</kbd> to send • Current: {aiProvider.toUpperCase()} • Port: 5001
                        </small>
                        <small className="search-hint">
                          💡 Try: "search for web development courses" or "find Python courses"
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Features & Tips */}
            <div className="col-lg-4 mt-4 mt-lg-0">
              {/* Features Card */}
              <div className="card border-0 shadow-lg mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-magic text-primary me-2"></i>
                    AI Features
                  </h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fas fa-search text-success me-2"></i>
                      <strong>Smart Search:</strong> Find courses with natural language
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-comment-alt text-info me-2"></i>
                      <strong>AI Chat:</strong> Get personalized learning advice
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-graduation-cap text-warning me-2"></i>
                      <strong>Course Recommendations:</strong> Based on your interests
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-lightbulb text-purple me-2"></i>
                      <strong>Learning Paths:</strong> Step-by-step guidance
                    </li>
                    <li>
                      <i className="fas fa-history text-secondary me-2"></i>
                      <strong>Chat History:</strong> Your conversations are saved
                    </li>
                  </ul>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="card border-0 shadow-lg">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-lightbulb text-warning me-2"></i>
                    Quick Tips
                  </h5>
                  <div className="mb-3">
                    <h6 className="text-primary small">💡 Search for courses about:</h6>
                    <ul className="list-unstyled small">
                      <li className="mb-1">• Web Development Fundamentals</li>
                      <li className="mb-1">• Data Science with Python</li>
                      <li className="mb-1">• Machine Learning Fundamentals</li>
                      <li className="mb-1">• UI/UX Design Principles</li>
                      <li>• Python Programming</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="text-primary small">💡 Try asking:</h6>
                    <ul className="list-unstyled small">
                      <li className="mb-1">• "What courses do you have?"</li>
                      <li className="mb-1">• "Explain web development"</li>
                      <li className="mb-1">• "How do I become a data scientist?"</li>
                      <li className="mb-1">• "Recommend beginner courses"</li>
                      <li>• "What is React?"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom styles for full-page mode */}
      <style jsx="true">{`
        .ai-chatbot-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .chat-header-full {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .chat-avatar-large {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
        }
        
        .avatar-icon-large {
          font-size: 32px;
        }
        
        .chat-body-full {
          height: calc(100vh - 300px);
          min-height: 400px;
        }
        
        .chat-footer-full {
          background: var(--bg-card);
        }
        
        .chat-body-full::-webkit-scrollbar {
          width: 8px;
        }
        
        .chat-body-full::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }
        
        .chat-body-full::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        
        .chat-body-full::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .chat-header-full .d-flex {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 15px;
          }
          
          .chat-header-full .d-flex > div:last-child {
            width: 100%;
          }
          
          .chat-body-full {
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default AIChatbotPage;