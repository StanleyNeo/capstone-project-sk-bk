// Create: src/components/ResponseDebug.js
import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const ResponseDebug = () => {
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const testEndpoints = async () => {
      const tests = [
        { name: 'getAnalyticsDashboard', func: ApiService.getAnalyticsDashboard },
        { name: 'getAnalyticsSummary', func: ApiService.getAnalyticsSummary },
        { name: 'getStats', func: ApiService.getStats },
        { name: 'getSchools', func: ApiService.getSchools },
        { name: 'addSchool', func: async () => {
          const testData = { name: 'Test', address: 'Test', principal: 'Test' };
          return await ApiService.addSchool(testData);
        }}
      ];

      const results = {};
      for (const test of tests) {
        try {
          const response = await test.func();
          results[test.name] = {
            fullResponse: response,
            success: response?.success,
            hasData: !!response?.data,
            dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
            dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A'
          };
        } catch (error) {
          results[test.name] = { error: error.message };
        }
      }
      setResponses(results);
    };

    testEndpoints();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h3>API Response Structure Debug</h3>
      <pre>{JSON.stringify(responses, null, 2)}</pre>
    </div>
  );
};

export default ResponseDebug;