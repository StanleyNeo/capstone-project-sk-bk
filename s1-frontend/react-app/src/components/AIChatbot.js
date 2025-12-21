import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api'; // Add this import
import './AIChatbot.css'; // We'll create this CSS

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarters, setConversationStarters] = useState([]);
  const [searchResults, setSearchResults] = useState([]); // NEW: For search results
  const [searchHints, setSearchHints] = useState([]); // NEW: For search hints
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
      // Default starters
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
        // Extract course titles and categories for search hints
        const hints = coursesResponse.data
          .map(course => course.title)
          .slice(0, 5); // Top 5 course titles as hints
        
        setSearchHints(hints);
      }
    } catch (error) {
      console.error('Failed to fetch search hints:', error);
    }
  };

  // Perform search when user asks about courses
  const performSearch = async (query) => {
    try {
      console.log('🔍 Searching for:', query);
      
      // Search courses from analytics backend
      const searchResponse = await ApiService.searchCourses(query);
      console.log('Search response:', searchResponse);
      
      if (searchResponse.success && Array.isArray(searchResponse.results)) {
        setSearchResults(searchResponse.results.slice(0, 5)); // Top 5 results
        
        // Format search results for display
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
        // Fallback: Search in local courses
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

  // Enhanced send message with search capabilities
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
    setSearchResults([]); // Clear previous search results

    // Check if message contains search keywords
    const isSearchQuery = messageText.toLowerCase().includes('search') || 
                         messageText.toLowerCase().includes('find') ||
                         messageText.toLowerCase().includes('look for') ||
                         messageText.toLowerCase().includes('course about') ||
                         messageText.toLowerCase().includes('courses for') ||
                         messageText.toLowerCase().includes('learn');

    try {
      if (isSearchQuery) {
        // Extract search query
        const searchQuery = messageText.replace(/search|find|look for|courses? for|learn|about/gi, '').trim();
        
        // Get search results first
        const searchResults = await performSearch(searchQuery || messageText);
        
        // Then send to AI
        const aiResponse = await sendToAI(messageText, searchResults);
        
        // Add AI response
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
        // Regular AI chat
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
  text: "I apologize, but I'm having trouble connecting to the chatbot service. Please make sure the MongoDB backend is running on port 5000.", // Changed from 5001 to 5000
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
    
    const response = await fetch('http://localhost:5001/api/ai/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        message: messageText,
        provider: aiProvider, // Pass the selected provider
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
      // Check if it's still the generic greeting (just in case)
      if (data.response.includes("Hello! I'm ready to help you learn")) {
        console.log('⚠️ Got generic greeting, using fallback instead');
        return {
          text: generateSpecificResponse(messageText),
          provider: data.provider || 'ai',
          suggestions: data.suggestions || generateFollowUpQuestions(messageText, searchResults),
          data: data.data || null
        };
      }
      
      // Return the actual AI response
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
    // Return fallback response
    return {
      text: generateSpecificResponse(messageText),
      provider: 'error',
      suggestions: generateFollowUpQuestions(messageText, searchResults)
    };
  }
};

// Add this helper function
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



  // Generate follow-up questions based on context
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
    
    return questions.slice(0, 3); // Return top 3 questions
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

    // Test actual AI response
    const response = await fetch('http://localhost:5001/api/ai/chat', {
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

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
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

  // Render message with formatting
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
    <>
      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle-btn"
        onClick={toggleChat}
        title="AI Learning Assistant"
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <>
            <span className="chat-icon">💬</span>
            <span className="notification-dot"></span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <span className="avatar-icon">🤖</span>
              </div>
              <div className="chat-info">
                <h3 className="chat-title">AI Learning Assistant</h3>
                <div className="chat-status">
                  <span className="status-dot online"></span>
                  <span className="status-text">
                    Connected to Port 5001 • Provider: {aiProvider.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="chat-header-right">
              <div className="provider-selector">
                <select 
                  value={aiProvider}
                  onChange={(e) => changeProvider(e.target.value)}
                  className="form-select form-select-sm"
                  disabled={isLoading}
                >
                  <option value="auto">🤖 Auto (Smart)</option>
                  <option value="openai">⚡ OpenAI</option>
                  <option value="gemini">🔮 Gemini</option>
                  <option value="deepseek">🌊 DeepSeek</option>
                </select>
              </div>
              <button 
                className="header-btn test-btn"
                onClick={testAIConnection}
                title="Test AI Connection"
                disabled={isLoading}
              >
                <span className="btn-icon">🔧</span>
              </button>
              <button 
                className="header-btn clear-btn"
                onClick={clearConversation}
                title="Clear conversation"
                disabled={isLoading}
              >
                <span className="btn-icon">🗑️</span>
              </button>
              <button 
                className="header-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <span className="btn-icon">✕</span>
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="chat-body" ref={chatContainerRef}>
            {/* Welcome Message */}
            <div className="welcome-section">
              <div className="welcome-card">
                <div className="welcome-icon">👋</div>
                <h4 className="welcome-title">How can I help you today?</h4>
                <p className="welcome-text">
                  I'm connected to the AI backend on port 5001. Ask me about courses, programming, or learning advice!
                </p>
                <div className="welcome-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={testAIConnection}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </button>
                  <small className="text-muted ms-2">
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
          <div className="chat-footer">
            <div className="input-container">
              <div className="input-wrapper">
                <textarea
                  className="chat-input"
                  placeholder={`Ask me anything or search for courses...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  rows="1"
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
              
              <div className="input-hints">
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
      )}
    </>
  );
};

export default AIChatbot;