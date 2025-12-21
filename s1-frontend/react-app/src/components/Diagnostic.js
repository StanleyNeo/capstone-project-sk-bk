import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const Diagnostic = () => {
  const [apiResponses, setApiResponses] = useState({});

  useEffect(() => {
    const testEndpoints = async () => {
      const endpoints = {
        stats: () => ApiService.getStats(),
        users: () => ApiService.getUsers(),
        courses: () => ApiService.getCoursesFromAnalytics(),
        enrollments: () => ApiService.getEnrollments(),
        // Test the addSchool function specifically
        addSchoolTest: async () => {
          const testData = { name: 'Test School', address: 'Test', principal: 'Test' };
          return await ApiService.addSchool(testData);
        }
      };

      const results = {};
      for (const [key, func] of Object.entries(endpoints)) {
        try {
          results[key] = await func();
          console.log(`Diagnostic - ${key}:`, results[key]);
        } catch (error) {
          results[key] = { error: error.message };
        }
      }
      setApiResponses(results);
    };

    testEndpoints();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
      <h2>API Diagnostic Tool</h2>
      <p>This shows the raw response from each backend endpoint. Use this to fix your components.</p>
      {Object.entries(apiResponses).map(([key, response]) => (
        <div key={key} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Endpoint: {key}</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default Diagnostic;