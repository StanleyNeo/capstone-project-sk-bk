import React, { useState } from 'react';
import ApiService from '../services/api'; // Import your ApiService

function SearchTest() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: 'smart' })
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>🔍 Search Test Page</h1>
      
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          className="btn btn-primary mt-2"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <h3>Results: {results.length} found</h3>
      <div className="list-group">
        {results.map((course, index) => (
          <div key={index} className="list-group-item">
            <h5>{course.title}</h5>
            <p>{course.description}</p>
            <div className="d-flex gap-2">
              <span className="badge bg-primary">{course.category}</span>
              <span className="badge bg-secondary">{course.level}</span>
              <span className="badge bg-success">{course.relevanceScore}% match</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchTest;