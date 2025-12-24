import React, { useState, useEffect, useRef } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Learning Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botResponses = {
    greeting: [
      "Hello! How can I assist with your learning today?",
      "Hi there! Ready to learn something new?",
      "Welcome! I'm here to help you with your courses."
    ],
    courses: [
      "We have courses in Web Development, Data Science, AI, and Design.",
      "Check our courses page for the latest offerings.",
      "I recommend starting with our beginner-friendly courses."
    ],
    help: [
      "You can ask me about courses, enrollment, or learning tips.",
      "Try asking: 'What courses do you have?' or 'Help me choose a course'."
    ],
    enrollment: [
      "You can enroll in courses from the Courses page.",
      "Simply click 'Enroll Now' on any course to get started."
    ],
    ai: [
      "Our AI courses cover machine learning, deep learning, and neural networks.",
      "Check out 'AI Fundamentals' for a comprehensive introduction."
    ],
    default: [
      "I'm not sure about that. Can you rephrase?",
      "Let me connect you with a human advisor for that question.",
      "That's beyond my current knowledge. Try asking about courses or enrollment."
    ]
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi')) {
      return botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)];
    }
    if (input.includes('course')) {
      return botResponses.courses[Math.floor(Math.random() * botResponses.courses.length)];
    }
    if (input.includes('help')) {
      return botResponses.help[Math.floor(Math.random() * botResponses.help.length)];
    }
    if (input.includes('enroll') || input.includes('join')) {
      return botResponses.enrollment[Math.floor(Math.random() * botResponses.enrollment.length)];
    }
    if (input.includes('ai') || input.includes('artificial')) {
      return botResponses.ai[Math.floor(Math.random() * botResponses.ai.length)];
    }
    
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    
    // Get bot response after delay
    setTimeout(() => {
      const response = getBotResponse(input);
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickQuestions = [
    "What courses do you have?",
    "How do I enroll?",
    "Tell me about AI courses",
    "I need help choosing"
  ];

  return (
    <>
      {/* Chatbot Button */}
      <button
        className="btn btn-primary rounded-circle position-fixed"
        style={{
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          zIndex: 1000
        }}
        onClick={() => setIsOpen(true)}
      >
        🤖
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="position-fixed"
          style={{
            bottom: '80px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="bg-primary text-white p-3 rounded-top">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">AI Learning Assistant</h5>
              <button 
                className="btn btn-sm btn-light"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            className="flex-grow-1 p-3 overflow-auto"
            style={{ maxHeight: '350px' }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`mb-3 ${msg.sender === 'user' ? 'text-end' : ''}`}
              >
                <div 
                  className={`d-inline-block p-2 rounded ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-light'
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-3 pb-2">
            <small className="text-muted">Quick questions:</small>
            <div className="d-flex flex-wrap gap-1">
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => handleSend(), 100);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-top">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="btn btn-primary"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;