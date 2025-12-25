import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ApiTester from './components/ApiTester';
import Home from './pages/Home';
import Login from './pages/Login';
import './Courses.css';
import Courses from './pages/Courses';
import Schools from './pages/Schools';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminDashboard from './pages/AdminDashboard';
import SearchTest from './pages/SearchTest';
import AIFeatures from './pages/AIFeatures';
import DatabaseStats from './components/DatabaseStats';
import AIChatbot from './components/AIChatbot';
import Diagnostic from './components/Diagnostic';
import AIChatbotPage from './pages/AIChatbotPage';

function App() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="App">
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
              <div className="container">
                <Link className="navbar-brand" to="/">
                  <i className="bi bi-robot me-2"></i>
                  AI-LMS
                  {!isProduction && <small className="ms-2 text-warning">DEV</small>}
                </Link>

                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mainNavbar"
                  aria-controls="mainNavbar"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="mainNavbar">
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <Link className="nav-link" to="/">Home</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/courses">Courses</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/ai-features">
                        <i className="fas fa-robot me-1"></i>
                        AI Features
                      </Link>
                    </li>

                    {/* Show AI Chatbot in BOTH environments */}
                    <li className="nav-item">
                      <Link className="nav-link" to="/ai-chatbot">
                        <i className="bi bi-chat-left-text me-1"></i>
                        AI Chatbot
                      </Link>
                    </li>

                    {/* Development: Show Schools & Admin */}
                    {!isProduction && (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link" to="/schools">Schools</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to="/admin">Admin</Link>
                        </li>
                      </>
                    )}
                  </ul>

                  <ul className="navbar-nav">
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">
                        <i className="bi bi-person-circle me-1"></i>
                        Login
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
            
            <div className="container mt-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ai-features" element={<AIFeatures />} />
                <Route path="/login" element={<Login />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* AI Chatbot Page - Always Available */}
                <Route path="/ai-chatbot" element={<AIChatbotPage />} />
                
                {/* Development-only routes */}
                {!isProduction && (
                  <>
                    <Route path="/schools" element={<Schools />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </>
                )}
                
                <Route path="/search-test" element={<SearchTest />} />
                <Route path="/api-test" element={<ApiTester />} />
                
                {/* Production Redirects */}
                {isProduction && (
                  <>
                    <Route path="/schools" element={<Navigate to="/" replace />} />
                    <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                  </>
                )}
              </Routes>
            </div>
            
            <footer className="bg-light mt-5 py-3 border-top">
              <div className="container text-center">
                <p className="mb-0 text-muted">
                  AI-Powered Learning Management System © 2025
                  {!isProduction && <span className="text-danger ms-2">[DEV MODE]</span>}
                </p>
              </div>
            </footer>
            
            {/* Floating Chatbot - Shows on ALL pages */}
            <AIChatbot />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;