import React, { useState, useEffect, useRef } from 'react';
import './SmartSearch.css'; // We'll create this CSS file
const BASE_URL = 'http://localhost:5001/api/ai'; // Changed from port 5000
function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('enhanced'); // enhanced, smart, keyword
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  // Popular searches with icons
  const popularSearches = [
    { term: 'Python Programming', icon: '🐍', category: 'Programming' },
    { term: 'Web Development', icon: '🌐', category: 'Web Development' },
    { term: 'Data Science', icon: '📊', category: 'Data Science' },
    { term: 'AI & Machine Learning', icon: '🤖', category: 'AI/ML' },
    { term: 'React JS', icon: '⚛️', category: 'Web Development' },
    { term: 'JavaScript Fundamentals', icon: '📜', category: 'Programming' },
    { term: 'UI/UX Design', icon: '🎨', category: 'Design' },
    { term: 'Beginner Courses', icon: '👶', category: 'All' }
  ];

  // Initialize search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('smartSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search to history
  const saveToHistory = (searchQuery, searchType) => {
    if (!searchQuery.trim()) return;
    
    const searchEntry = {
      query: searchQuery,
      type: searchType,
      timestamp: new Date().toISOString(),
      resultsCount: results.length
    };
    
    const newHistory = [
      searchEntry,
      ...searchHistory.filter(item => item.query !== searchQuery)
    ].slice(0, 8); // Keep last 8 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('smartSearchHistory', JSON.stringify(newHistory));
  };

  // Get search suggestions
const fetchSuggestions = async (queryText) => {
  if (queryText.length < 2) {
    setSuggestions([]);
    return;
  }

  try {
    // Use the search endpoint for suggestions
    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText })
    });
    
    const data = await response.json();
    
    if (data.success && data.results) {
      const suggestions = data.results
        .slice(0, 5)
        .map(course => course.title);
      
      setSuggestions([...new Set(suggestions)]);
      setShowSuggestions(true);
    }
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
  }
};

  // Handle search
// Handle search - REPLACE THE ENTIRE FUNCTION WITH THIS:
const handleSearch = async (searchQuery = query) => {
  if (!searchQuery.trim()) return;

  setLoading(true);
  setError(null);
  setShowSuggestions(false);
  setInsights(null);

  try {
    let response;
    
    if (searchType === 'enhanced') {
      // Use AI recommendation for enhanced search
      response = await fetch(`${BASE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          interest: searchQuery, 
          level: 'all',
          context: 'enhanced_search' 
        })
      });
    } else if (searchType === 'smart') {
      // Use AI search
      response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
    } else {
      // Basic keyword search
      response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Enhanced search returns recommendations, others return results
      let results = [];
      
      if (searchType === 'enhanced') {
        results = data.recommendations || data.courses || [];
      } else {
        results = data.results || data.courses || [];
      }
      
      // Ensure all results have required fields
      results = results.map(course => ({
        _id: course.id || course._id || Math.random().toString(),
        title: course.title || 'Untitled Course',
        description: course.description || 'No description available',
        category: course.category || 'Uncategorized',
        level: course.level || 'Beginner',
        instructor: course.instructor || 'Unknown',
        duration: course.duration || 'N/A',
        rating: course.rating || 0,
        enrolledStudents: course.enrolledStudents || 0,
        relevanceScore: course.relevanceScore || 0,
        matchReasons: course.whyRecommended ? [course.whyRecommended] : []
      }));
      
      setResults(results);
      
      // Generate insights
      if (results.length > 0) {
        const insights = {
          averageScore: Math.round(results.reduce((sum, c) => sum + (c.relevanceScore || 0), 0) / results.length),
          categoriesFound: [...new Set(results.map(c => c.category))],
          matchedPatterns: results.slice(0, 3).map(c => c.category),
          topCategory: results[0]?.category,
          totalCourses: results.length
        };
        setInsights(insights);
      }
      
      saveToHistory(searchQuery, searchType);
    } else {
      setResults([]);
      setError(data.error || 'Search failed. Please try again.');
    }
  } catch (error) {
    console.error('Search error:', error);
    setError('Failed to connect to AI backend. Please check if port 5001 is running.');
    setResults([]);
  } finally {
    setLoading(false);
  }
};


  // Handle quick search
  const handleQuickSearch = (term) => {
    setQuery(term);
    setTimeout(() => {
      handleSearch(term);
    }, 100);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // Clear search
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setInsights(null);
    setShowSuggestions(false);
    setError(null);
    searchInputRef.current?.focus();
  };

  // Auto-fetch suggestions on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format time for history
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="smart-search-container">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <i className="fas fa-robot me-2"></i>
                AI-Powered Course Search
              </h5>
              <small className="opacity-75">
                Find the perfect courses with intelligent search
              </small>
            </div>
            <div className="badge bg-light text-primary">
              v2.0 Enhanced
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Search Type Selector */}
          <div className="search-type-selector mb-4">
            <div className="d-flex flex-wrap gap-2 mb-2">
              <button
                className={`btn ${searchType === 'enhanced' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSearchType('enhanced')}
              >
                <i className="fas fa-brain me-2"></i>
                Enhanced AI
              </button>
              <button
                className={`btn ${searchType === 'smart' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSearchType('smart')}
              >
                <i className="fas fa-robot me-2"></i>
                Smart Search
              </button>
              <button
                className={`btn ${searchType === 'keyword' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSearchType('keyword')}
              >
                <i className="fas fa-search me-2"></i>
                Keyword
              </button>
            </div>
            
            <div className="search-type-info">
              <small>
                {searchType === 'enhanced' && (
                  <span className="text-primary">
                    <i className="fas fa-info-circle me-1"></i>
                    Advanced AI with pattern recognition and insights
                  </span>
                )}
                {searchType === 'smart' && (
                  <span className="text-info">
                    <i className="fas fa-info-circle me-1"></i>
                    AI-powered natural language understanding
                  </span>
                )}
                {searchType === 'keyword' && (
                  <span className="text-secondary">
                    <i className="fas fa-info-circle me-1"></i>
                    Traditional exact keyword matching
                  </span>
                )}
              </small>
            </div>
          </div>

          {/* Search Input with Suggestions */}
          <div className="search-input-container mb-4" ref={searchInputRef}>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-light">
                <i className="fas fa-search text-primary"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Ask anything like: 'Learn Python for data analysis as a beginner'..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                ref={searchInputRef}
              />
              <button 
                className="btn btn-primary"
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search me-2"></i>
                    Search
                  </>
                )}
              </button>
              {query && (
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleClearSearch}
                  title="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                <div className="card shadow-sm">
                  <div className="card-body p-2">
                    <small className="text-muted d-block mb-2">
                      <i className="fas fa-lightbulb me-1"></i>
                      Suggestions:
                    </small>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="btn btn-sm btn-outline-primary d-block w-100 text-start mb-1"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <i className="fas fa-search me-2"></i>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Popular Searches */}
          <div className="popular-searches mb-4">
            <h6 className="section-title">
              <i className="fas fa-bolt me-2"></i>
              Popular Searches
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {popularSearches.map((item, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-outline-primary popular-search-btn"
                  onClick={() => handleQuickSearch(item.term)}
                  disabled={loading}
                  title={`${item.term} (${item.category})`}
                >
                  <span className="search-icon">{item.icon}</span>
                  {item.term}
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="search-history mb-4">
              <h6 className="section-title">
                <i className="fas fa-history me-2"></i>
                Recent Searches
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    className="btn btn-sm btn-outline-secondary history-item"
                    onClick={() => {
                      setQuery(item.query);
                      setSearchType(item.type);
                      setTimeout(() => handleSearch(item.query), 100);
                    }}
                    disabled={loading}
                    title={`Searched at ${formatTime(item.timestamp)}`}
                  >
                    <span className="badge bg-primary me-1">
                      {item.type.charAt(0).toUpperCase()}
                    </span>
                    {item.query.substring(0, 20)}...
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    setSearchHistory([]);
                    localStorage.removeItem('smartSearchHistory');
                  }}
                >
                  <i className="fas fa-trash"></i> Clear
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Error:</strong> {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* Search Insights */}
          {insights && (
            <div className="search-insights mb-4">
              <div className="card border-info">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Search Insights
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 text-center">
                      <div className="insight-value">{results.length}</div>
                      <div className="insight-label">Courses Found</div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="insight-value">{insights.averageScore || 0}%</div>
                      <div className="insight-label">Avg Relevance</div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="insight-value">{insights.matchedPatterns?.length || 0}</div>
                      <div className="insight-label">Patterns Matched</div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="insight-value">{insights.categoriesFound?.length || 0}</div>
                      <div className="insight-label">Categories</div>
                    </div>
                  </div>
                  {insights.matchedPatterns?.length > 0 && (
                    <div className="mt-3">
                      <small className="text-muted">AI detected patterns:</small>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {insights.matchedPatterns.map((pattern, idx) => (
                          <span key={idx} className="badge bg-primary">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 ? (
            <div className="search-results">
              <div className="results-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-list-check me-2"></i>
                    Search Results ({results.length} courses)
                  </h5>
                  <div className="badge bg-primary">
                    {searchType === 'enhanced' ? '🤖 Enhanced AI' : 
                     searchType === 'smart' ? '🤖 Smart Search' : '🔤 Keyword Search'}
                  </div>
                </div>
                {insights?.topCategory && (
                  <small className="text-muted">
                    Top category: <strong>{insights.topCategory}</strong>
                  </small>
                )}
              </div>

              <div className="results-grid">
                {results.map((course, index) => (
                  <div className={`course-card ${index < 3 ? 'featured' : ''}`} key={course._id}>
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="course-header">
                          <h6 className="course-title">
                            {course.title}
                            {index < 3 && (
                              <span className="featured-badge">🔥 Top Match</span>
                            )}
                          </h6>
                          <div className="relevance-score">
                            <div className="score-circle">
                              {course.relevanceScore || 0}%
                            </div>
                            <small className="text-muted">Relevance</small>
                          </div>
                        </div>
                        
                        <p className="course-description">
                          {course.description?.substring(0, 120)}...
                        </p>
                        
                        <div className="course-meta">
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <span className="badge bg-primary">
                              <i className="fas fa-tag me-1"></i>
                              {course.category}
                            </span>
                            <span className="badge bg-secondary">
                              <i className="fas fa-signal me-1"></i>
                              {course.level}
                            </span>
                            <span className="badge bg-info">
                              <i className="fas fa-clock me-1"></i>
                              {course.duration || 'N/A'}
                            </span>
                            {course.rating && (
                              <span className="badge bg-warning">
                                <i className="fas fa-star me-1"></i>
                                {course.rating}
                              </span>
                            )}
                          </div>
                          
                          <div className="course-stats">
                            <div className="stat-item">
                              <i className="fas fa-users text-muted me-1"></i>
                              <span>{course.enrolledStudents || 0} students</span>
                            </div>
                            <div className="stat-item">
                              <i className="fas fa-user-graduate text-muted me-1"></i>
                              <span>{course.instructor || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Match Reasons (Enhanced Search Only) */}
                        {searchType === 'enhanced' && course.matchReasons && (
                          <div className="match-reasons">
                            <small className="text-muted d-block mb-1">
                              <i className="fas fa-lightbulb me-1"></i>
                              Why this matches:
                            </small>
                            <div className="d-flex flex-wrap gap-1">
                              {course.matchReasons.map((reason, idx) => (
                                <span key={idx} className="badge bg-light text-dark">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : query && !loading && !error ? (
            <div className="no-results">
              <div className="alert alert-warning">
                <div className="d-flex align-items-center">
                  <i className="fas fa-search fa-2x me-3"></i>
                  <div>
                    <h6 className="mb-1">No courses found for "<strong>{query}</strong>"</h6>
                    <p className="mb-0 small">
                      Try different keywords or use natural language with Enhanced AI search.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="card-footer">
          <div className="row">
            <div className="col-md-8">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                <strong>Tips:</strong> 
                {searchType === 'enhanced' && ' Use natural language for best results'}
                {searchType === 'smart' && ' Try questions like "What should I learn after Python?"'}
                {searchType === 'keyword' && ' Use specific keywords for exact matches'}
              </small>
            </div>
            <div className="col-md-4 text-end">
              <small>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => window.open('http://localhost:5001/api/ai/test', '_blank')}
                >
                  <i className="fas fa-external-link-alt me-1"></i>
                  API Status
                </button>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartSearch;