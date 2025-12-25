import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ApiTester from './components/ApiTester';
import Home from './pages/Home';
import Login from './pages/Login';
import './Courses.css'; // Add this at top of Courses.js
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

function App() {
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
              </Link>

              {/* ✅ TOGGLER BUTTON (CRITICAL) */}
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

              {/* ✅ COLLAPSIBLE MENU WITH ID */}
              <div className="collapse navbar-collapse" id="mainNavbar">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <Link className="nav-link" to="/">Home</Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/courses">Courses</Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/schools">Schools</Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">Admin</Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/ai-features">
                      <i className="fas fa-robot me-1"></i>
                      AI Features
                    </Link>
                  </li>
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
                <Route path="/schools" element={<Schools />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/search-test" element={<SearchTest />} />
                <Route path="/api-test" element={<ApiTester />} /> {/* Add this line */}
              </Routes>
            </div>
            
            <footer className="bg-light mt-5 py-3 border-top">
              <div className="container text-center">
                <p className="mb-0 text-muted">
                  AI-Powered Learning Management System © 2025
                </p>
              </div>
            </footer>
             <AIChatbot />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;