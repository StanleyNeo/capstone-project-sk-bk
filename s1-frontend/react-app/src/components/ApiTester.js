import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const ApiTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApis = async () => {
      const endpoints = {
        stats: () => ApiService.getStats(),
        users: () => ApiService.getUsers(),
        courses: () => ApiService.getCoursesFromAnalytics(),
        enrollments: () => ApiService.getEnrollments(),
        schools: () => ApiService.getSchools(),
        health_5000: () => ApiService.checkAnalyticsBackend(),
        health_5001: () => ApiService.checkCoursesBackend(),
        // Test addSchool function
        addSchoolTest: async () => {
          const testData = { 
            name: 'Test School ' + Date.now(), 
            address: '123 Test St', 
            principal: 'Test Principal' 
          };
          return await ApiService.addSchool(testData);
        }
      };

      const testResults = {};
      for (const [name, func] of Object.entries(endpoints)) {
        try {
          console.log(`Testing: ${name}...`);
          const response = await func();
          testResults[name] = {
            success: response?.success !== undefined ? response.success : true,
            data: response?.data || response,
            fullResponse: response,
            status: '✅ Success'
          };
        } catch (error) {
          testResults[name] = { 
            error: error.message,
            status: '❌ Error'
          };
        }
      }
      setResults(testResults);
      setLoading(false);
    };

    testApis();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Testing APIs...</span>
        </div>
        <p className="mt-2">Testing all API endpoints...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🔧 API Tester - Debug Tool</h2>
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">API Endpoint Test Results</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {Object.entries(results).map(([endpoint, result]) => (
              <div className="col-md-6 mb-3" key={endpoint}>
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>{endpoint}</strong>
                    <span className={`badge ${result.status === '✅ Success' ? 'bg-success' : 'bg-danger'}`}>
                      {result.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="card-body">
                    <pre style={{ 
                      fontSize: '12px', 
                      maxHeight: '200px', 
                      overflow: 'auto',
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px'
                    }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h5>Summary:</h5>
            <div className="alert alert-info">
              <p><strong>Backend Status:</strong></p>
              <ul>
                <li>Port 5000 (MongoDB Analytics): {results.health_5000?.success ? '✅ Connected' : '❌ Disconnected'}</li>
                <li>Port 5001 (AI/Courses): {results.health_5001?.success ? '✅ Connected' : '❌ Disconnected'}</li>
              </ul>
              <p><strong>MongoDB Data Counts:</strong></p>
              <ul>
                <li>Users: {results.users?.data?.length || '0'}</li>
                <li>Courses: {results.courses?.data?.length || '0'}</li>
                <li>Enrollments: {results.enrollments?.data?.length || '0'}</li>
                <li>Schools: {results.schools?.length || results.schools?.data?.length || '0'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTester;