import React from 'react';
import { Link } from 'react-router-dom';
import SmartSearch from '../components/SmartSearch';
import ApiService from '../services/api'; // Import your ApiService
function AIFeatures() {
  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg border-0" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}>
            <div className="card-body text-white text-center py-5">
              <h1 className="display-4 mb-3">
                <i className="fas fa-robot me-3"></i>
                AI-Powered Learning Features
              </h1>
              <p className="lead mb-4">
                Experience the future of course discovery with our advanced AI algorithms
              </p>
              <div className="d-flex justify-content-center gap-3">
                <a href="#smart-search" className="btn btn-light btn-lg">
                  <i className="fas fa-search me-2"></i>
                  Try Smart Search
                </a>
                <Link to="/" className="btn btn-outline-light btn-lg">
                  <i className="fas fa-home me-2"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Content - Smart Search */}
        <div className="col-lg-8">
          <div id="smart-search" className="mb-5">
            <SmartSearch />
          </div>

          {/* Feature Cards */}
          <div className="row mb-5">
            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="feature-icon mb-3">
                    <div className="bg-primary text-white rounded-circle p-3 d-inline-block">
                      <i className="fas fa-brain fa-2x"></i>
                    </div>
                  </div>
                  <h4 className="card-title">Enhanced AI Search</h4>
                  <p className="card-text">
                    Our advanced AI understands natural language, context, and learning intent. 
                    It uses weighted pattern matching to find the most relevant courses.
                  </p>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-check text-success me-2"></i> Natural language processing</li>
                    <li><i className="fas fa-check text-success me-2"></i> Context-aware recommendations</li>
                    <li><i className="fas fa-check text-success me-2"></i> Pattern recognition</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="feature-icon mb-3">
                    <div className="bg-success text-white rounded-circle p-3 d-inline-block">
                      <i className="fas fa-chart-line fa-2x"></i>
                    </div>
                  </div>
                  <h4 className="card-title">Search Insights</h4>
                  <p className="card-text">
                    Get detailed insights about your search results, including relevance scores,
                    matched patterns, and category distribution.
                  </p>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-check text-success me-2"></i> Relevance scoring (0-100%)</li>
                    <li><i className="fas fa-check text-success me-2"></i> Pattern detection</li>
                    <li><i className="fas fa-check text-success me-2"></i> Match reasons</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="feature-icon mb-3">
                    <div className="bg-warning text-white rounded-circle p-3 d-inline-block">
                      <i className="fas fa-history fa-2x"></i>
                    </div>
                  </div>
                  <h4 className="card-title">Search History</h4>
                  <p className="card-text">
                    Your search history is saved locally, allowing you to quickly revisit previous
                    searches and compare different search types.
                  </p>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-check text-success me-2"></i> Local storage</li>
                    <li><i className="fas fa-check text-success me-2"></i> Search type tracking</li>
                    <li><i className="fas fa-check text-success me-2"></i> One-click re-search</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="feature-icon mb-3">
                    <div className="bg-info text-white rounded-circle p-3 d-inline-block">
                      <i className="fas fa-lightbulb fa-2x"></i>
                    </div>
                  </div>
                  <h4 className="card-title">Smart Suggestions</h4>
                  <p className="card-text">
                    Real-time search suggestions as you type, helping you discover related
                    courses and refine your search queries.
                  </p>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-check text-success me-2"></i> Real-time suggestions</li>
                    <li><i className="fas fa-check text-success me-2"></i> Popular searches</li>
                    <li><i className="fas fa-check text-success me-2"></i> Category-based ideas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '20px' }}>
            {/* Try These Searches */}
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-lightbulb me-2"></i>
                  Try These Searches
                </h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <button className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">🐍</span>
                    <div>
                      <strong>Python for Data Science</strong>
                      <div className="small text-muted">Enhanced AI search</div>
                    </div>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">🌐</span>
                    <div>
                      <strong>Web Development Beginner</strong>
                      <div className="small text-muted">Smart search</div>
                    </div>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">🤖</span>
                    <div>
                      <strong>AI Machine Learning</strong>
                      <div className="small text-muted">Enhanced AI search</div>
                    </div>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">🎨</span>
                    <div>
                      <strong>UI UX Design Courses</strong>
                      <div className="small text-muted">Keyword search</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Modes Comparison */}
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-compress-alt me-2"></i>
                  Search Modes Comparison
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Mode</th>
                        <th>Best For</th>
                        <th>Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge bg-primary">Enhanced AI</span></td>
                        <td>Complex queries</td>
                        <td>"Learn Python for data analysis"</td>
                      </tr>
                      <tr>
                        <td><span className="badge bg-info">Smart Search</span></td>
                        <td>Natural language</td>
                        <td>"I want to learn web development"</td>
                      </tr>
                      <tr>
                        <td><span className="badge bg-secondary">Keyword</span></td>
                        <td>Exact terms</td>
                        <td>"React JavaScript"</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Backend API Info */}
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-server me-2"></i>
                  Backend API Status
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success rounded-circle p-2 me-3">
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <div>
                    <strong>Backend Running</strong>
                    <div className="small text-muted">Port 5000</div>
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Available Endpoints:</small>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="badge bg-primary">/api/search</span>
                    <span className="badge bg-primary">/api/search/enhanced</span>
                    <span className="badge bg-primary">/api/search/smart</span>
                    <span className="badge bg-primary">/api/search/basic</span>
                  </div>
                </div>
                <a 
                  href="http://localhost:5000/api/search/health" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-dark w-100"
                >
                  <i className="fas fa-external-link-alt me-1"></i>
                  Check API Health
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="mb-3">Ready to experience AI-powered learning?</h5>
              <p className="text-muted mb-4">
                This system demonstrates advanced search capabilities that can be integrated into 
                any learning management system.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/" className="btn btn-primary">
                  <i className="fas fa-home me-2"></i>
                  Back to Dashboard
                </Link>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <i className="fas fa-arrow-up me-2"></i>
                  Back to Top
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIFeatures;