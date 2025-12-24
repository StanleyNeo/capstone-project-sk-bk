import React, { useState } from 'react';

function SimpleSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

// Update the handleSearch function in SmartSearch.js
const handleSearch = async (searchQuery = query) => {
  if (!searchQuery.trim()) return;

  setLoading(true);
  setError(null);
  setShowSuggestions(false);
  setInsights(null);

  try {
    let endpoint;
    let method = 'POST';
    let body;
    
    // Choose endpoint based on search type
    switch(searchType) {
      case 'enhanced':
        endpoint = 'http://localhost:5000/api/search/enhanced';
        body = JSON.stringify({ query: searchQuery });
        break;
      case 'smart':
        endpoint = 'http://localhost:5000/api/search/smart';
        body = JSON.stringify({ query: searchQuery });
        break;
      case 'keyword':
        endpoint = 'http://localhost:5000/api/search/basic';
        body = JSON.stringify({ query: searchQuery });
        break;
      default:
        endpoint = `http://localhost:5000/api/search/courses?q=${encodeURIComponent(searchQuery)}`;
        method = 'GET';
    }
    
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? body : undefined
    });
    
    const data = await response.json();
    
    if (data.success) {
      setResults(data.results || data.data || []);
      if (data.insights) setInsights(data.insights);
      saveToHistory(searchQuery, searchType);
    } else {
      setResults([]);
      setError(data.error || 'Search failed. Please try again.');
    }
  } catch (error) {
    console.error('Search error:', error);
    
    // Fallback: Try simple course search
    try {
      const fallbackResponse = await fetch(
        `http://localhost:5000/api/search/courses?q=${encodeURIComponent(searchQuery)}`
      );
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.success) {
        setResults(fallbackData.results || []);
        setError(null);
      } else {
        setError('Failed to connect to server. Please check if backend is running.');
        setResults([]);
      }
    } catch (fallbackError) {
      setError('Failed to connect to server. Please check if backend is running.');
      setResults([]);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="card mb-4 shadow">
      <div className="card-body">
        <h5 className="card-title mb-3">🔍 Search Courses</h5>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search for courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Searching...
                </>
              ) : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mb-3">
            <small>{error}</small>
          </div>
        )}

        {/* Quick Search Suggestions */}
        <div className="mb-3">
          <small className="text-muted d-block mb-2">Try searching for:</small>
          <div className="d-flex flex-wrap gap-2">
            {['web', 'python', 'ai', 'data', 'react', 'design'].map((term) => (
              <button
                key={term}
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setQuery(term);
                  setTimeout(() => handleSearch({ preventDefault: () => {} }), 100);
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h6 className="mb-2">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h6>
            <div className="list-group">
              {results.slice(0, 5).map((course, index) => (
                <div key={index} className="list-group-item">
                  <h6 className="mb-1">{course.title || course.name}</h6>
                  <p className="mb-1 small text-muted">
                    {course.description?.substring(0, 80)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-primary me-1">{course.level}</span>
                      <span className="badge bg-secondary">{course.category}</span>
                    </div>
                    <div className="text-muted small">
                      ⭐ {course.rating || 'N/A'} | 👥 {course.enrolledStudents || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




// Also update the fetchSuggestions function:
const fetchSuggestions = async (queryText) => {
  if (queryText.length < 2) {
    setSuggestions([]);
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/search/suggestions?q=${encodeURIComponent(queryText)}`
    );
    const data = await response.json();
    
    if (data.success) {
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    }
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    // Use local suggestions as fallback
    const localSuggestions = popularSearches
      .map(item => item.term)
      .filter(term => term.toLowerCase().includes(queryText.toLowerCase()))
      .slice(0, 5);
    setSuggestions(localSuggestions);
    setShowSuggestions(true);
  }
};

// Update the API Status button in the JSX:
<button 
  className="btn btn-sm btn-outline-primary"
  onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
>
  <i className="fas fa-external-link-alt me-1"></i>
  API Status
</button>
export default SimpleSearch;
