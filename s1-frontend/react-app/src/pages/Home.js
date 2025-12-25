// API Configuration - Using environment variables
const AI_BACKEND_URL = process.env.REACT_APP_AI_BACKEND_URL || 'http://localhost:5001';
const MONGO_BACKEND_URL = process.env.REACT_APP_MONGO_BACKEND_URL || 'http://localhost:5000';
const API_BASE = MONGO_BACKEND_URL + '/api' || 'http://localhost:5000/api';


import React, { useState, useEffect } from 'react';
import PasswordStrength from '../components/PasswordStrength';
import CourseToggle from '../components/CourseToggle';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';

import DatabaseStats from '../components/DatabaseStats';
import { Link } from 'react-router-dom';
import SmartSearch from '../components/SmartSearch';

function Home() {
  const { currentUser, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [interest, setInterest] = useState('');
  const [level, setLevel] = useState('beginner');
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeStudents: 0,
    completionRate: 0
  });
  const [backendStatus, setBackendStatus] = useState({
    port5000: false,
    port5001: false
  });

  useEffect(() => {
    loadData();
    checkBackends();
  }, []);

  const checkBackends = async () => {
    try {
      // Check port 5000
      const analyticsRes = await ApiService.getStats();
      setBackendStatus(prev => ({ ...prev, port5000: analyticsRes.success }));
      
      // Check port 5001
      const coursesRes = await ApiService.getCourses();
      setBackendStatus(prev => ({ ...prev, port5001: coursesRes.length > 0 }));
    } catch (error) {
      console.error('Backend check failed:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Get real courses
      const data = await ApiService.getCourses();
      setCourses(data);
      
      // Get real stats
      const statsRes = await ApiService.getStats();
      if (statsRes.success) {
        setStats({
          totalCourses: statsRes.data.courses || 0,
          activeStudents: statsRes.data.users || 0,
          completionRate: 22 // Default for now
        });
      } else {
        // Fallback stats
        setStats({
          totalCourses: data.length,
          activeStudents: data.reduce((sum, course) => sum + (course.students || 0), 0),
          completionRate: 22
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

const handleGetRecommendation = async () => {
  if (interest.trim()) {
    try {
      // ✅ Use existing ApiService (handles fallback + error resilience)
      const result = await ApiService.getAiRecommendations(interest, level);
      
      setRecommendation({
        message: result.message || `Found ${result.recommendations?.length || 0} recommendations`,
        recommendations: result.recommendations || result.courses || []
      });
    } catch (error) {
      console.error('Recommendation failed:', error);
      // Already handled in ApiService → fallback courses
    }
  }
};

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading data from backend...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-primary">AI-Powered Learning Management System</h1>
      
      {/* Backend Status Indicator */}
      {/* <div className="alert alert-info d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-server me-2"></i>
          <strong>Backend Status:</strong>
          <span className={`ms-2 ${backendStatus.port5000 ? 'text-success' : 'text-warning'}`}>
            Analytics: {backendStatus.port5000 ? '✅' : '⚠️'}
          </span>
          <span className={`ms-3 ${backendStatus.port5001 ? 'text-success' : 'text-warning'}`}>
            AI/Courses: {backendStatus.port5001 ? '✅' : '⚠️'}
          </span>
        </div>
        <button className="btn btn-sm btn-outline-primary" onClick={checkBackends}>
          <i className="fas fa-sync-alt"></i> Check
        </button>
      </div> */}

      {isAuthenticated && currentUser && (
        <div className="alert alert-success">
          Welcome back, <strong>{currentUser.name}</strong>! 
          {currentUser.enrolledCourses?.length > 0 && 
            ` You're enrolled in ${currentUser.enrolledCourses.length} courses.`
          }
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">Total Courses</h5>
              <p className="card-text display-6">{stats.totalCourses}</p>
              <small>From {backendStatus.port5001 ? 'Backend' : 'Sample Data'}</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Active Users</h5>
              <p className="card-text display-6">
                {stats.activeStudents}
              </p>
              <small>Registered in system</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">Success Rate</h5>
              <p className="card-text display-6">{stats.completionRate}%</p>
              <small>Course completion</small>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Engine */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">AI Course Recommender</h3>
          <p className="card-text">
            Tell us your interests and we'll recommend the perfect course for you!
          </p>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">What are you interested in?</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Web Development, AI, Data Science, Design"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Your Skill Level</label>
              <select 
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100"
                onClick={handleGetRecommendation}
              >
                Get Recommendations
              </button>
            </div>
          </div>

          {recommendation && (
            <div className={`alert ${recommendation.recommendations?.length > 0 ? 'alert-info' : 'alert-warning'}`}>
              <h5>AI Recommendations:</h5>
              <p>{recommendation.message || "No recommendations available"}</p>
              {recommendation.recommendations && recommendation.recommendations.length > 0 && (
                <div className="row mt-3">
                  {recommendation.recommendations.slice(0, 2).map(course => (
                    <div className="col-md-6" key={course.id || course.courseId}>
                      <div className="card">
                        <div className="card-body">
                          <h6>{course.name || course.title}</h6>
                          <p className="small">{(course.description || '').substring(0, 100)}...</p>
                          <span className="badge bg-primary">{course.level || 'Beginner'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Database Stats */}
      <div className="row mt-4">
        <div className="col-md-8">
          <DatabaseStats />
        </div>
        <div className="col-md-4">
          <SmartSearch />
          
          {/* Quick Stats Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6 className="card-title">📈 Quick Stats</h6>
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>Active Courses</span>
                  <span className="text-primary">{stats.totalCourses}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Users</span>
                  <span className="text-success">{stats.activeStudents}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Completion Rate</span>
                  <span className="text-warning">{stats.completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Engine */}
      {/* <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">AI Course Recommender</h3>
          <p className="card-text">
            Tell us your interests and we'll recommend the perfect course for you!
          </p>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">What are you interested in?</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Web Development, AI, Data Science, Design"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Your Skill Level</label>
              <select 
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100"
                onClick={handleGetRecommendation}
              >
                Get Recommendations
              </button>
            </div>
          </div>

          {recommendation && (
            <div className={`alert ${recommendation.recommendations?.length > 0 ? 'alert-info' : 'alert-warning'}`}>
              <h5>AI Recommendations:</h5>
              <p>{recommendation.message || "No recommendations available"}</p>
              {recommendation.recommendations && recommendation.recommendations.length > 0 && (
                <div className="row mt-3">
                  {recommendation.recommendations.slice(0, 2).map(course => (
                    <div className="col-md-6" key={course.id || course.courseId}>
                      <div className="card">
                        <div className="card-body">
                          <h6>{course.name || course.title}</h6>
                          <p className="small">{(course.description || '').substring(0, 100)}...</p>
                          <span className="badge bg-primary">{course.level || 'Beginner'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div> */}

      {/* Featured Courses */}
      {Array.isArray(courses) && courses.length > 0 ? (
        <div className="row">
          {courses.slice(0, 3).map(course => (
            <div className="col-md-4" key={course.id || course.courseId}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{course.name || course.title}</h5>
                  <p className="card-text">{(course.description || '').substring(0, 100)}...</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-secondary">{course.level || 'Beginner'}</span>
                    <span className="text-primary fw-bold">{course.price || 'Free'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-warning">
          No courses available. Please check backend connection.
        </div>
      )}

      {/* Practice Components */}
      <div className="row mb-4">
        <div className="col-md-6">
          <PasswordStrength />
        </div>
        <div className="col-md-6">
          <CourseToggle />
        </div>
      </div>
            {/* Backend Status Indicator */}
      <div className="alert alert-info d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-server me-2"></i>
          <strong>Backend Status:</strong>
          <span className={`ms-2 ${backendStatus.port5000 ? 'text-success' : 'text-warning'}`}>
            Analytics: {backendStatus.port5000 ? '✅' : '⚠️'}
          </span>
          <span className={`ms-3 ${backendStatus.port5001 ? 'text-success' : 'text-warning'}`}>
            AI/Courses: {backendStatus.port5001 ? '✅' : '⚠️'}
          </span>
        </div>
        <button className="btn btn-sm btn-outline-primary" onClick={checkBackends}>
          <i className="fas fa-sync-alt"></i> Check
        </button>
      </div>
    </div>

    
  );
}

// Add this function in your Home.js
const handleAISearch = async (query) => {
  try {
    setSearchLoading(true);
    setAiResponse('');
    
    // Try the AI backend first (port 5001)
    const aiResponse = await fetch('http://localhost:5001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query })
    });
    
    const aiData = await aiResponse.json();
    
    if (aiData.success) {
      setAiResponse(aiData.response);
    }
    
    // Also search for courses in MongoDB (port 5000)
    const coursesResponse = await fetch(`http://localhost:5000/api/search/courses?q=${query}`);
    const coursesData = await coursesResponse.json();
    
    if (coursesData.success && coursesData.results.length > 0) {
      // Format courses as a list
      const coursesList = coursesData.results.map(course => 
        `• ${course.title} (${course.level}) - ${course.description.substring(0, 100)}...`
      ).join('\n');
      
      setAiResponse(prev => prev + `\n\n**Found ${coursesData.results.length} courses:**\n${coursesList}`);
    }
    
  } catch (error) {
    console.error('AI Search error:', error);
    setAiResponse('I found these courses for you:\n• Web Development Fundamentals (Beginner)\n• Data Science with Python (Intermediate)\n• Machine Learning Fundamentals (Advanced)');
  } finally {
    setSearchLoading(false);
  }
};

export default Home;