import React, { useState, useEffect } from 'react';
import HybridApiService from '../services/HybridApiService';
import './AdminAIDashboard.css';
import config from './config';

axios.get(`${config.apiBaseUrl}/api/schools`)
const AdminAIDashboard = () => {
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState([]);
  const [costEstimate, setCostEstimate] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, providersRes] = await Promise.all([
        HybridApiService.getStats(),
        HybridApiService.getProviders()
      ]);
      
      if (statsRes.success) setStats(statsRes);
      if (providersRes.success) {
        setProviders(providersRes.available);
        setPriority(providersRes.currentPriority);
      }
      if (statsResponse) {
  if (statsResponse.success && statsResponse.data) {
    setStats(statsResponse.data);
  } else if (statsResponse.users !== undefined) {
    // If response is already the stats object
    setStats(statsResponse);
  } else {
    // Fallback to table counts
    setStats({
      users: allUsers.length,
      courses: allCourses.length,
      enrollments: allEnrollments.length
    });
  }
}
      calculateCostEstimate(statsRes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCostEstimate = (statsData) => {
    if (!statsData?.statistics?.providers) return;
    
    const costs = {
      openai: 0.0015, // $ per 1K tokens
      gemini: 0,      // Free tier
      deepseek: 0.0007 // $ per 1K tokens (estimated)
    };
    
    const estimate = {};
    Object.entries(statsData.statistics.providers).forEach(([provider, data]) => {
      const tokenCost = costs[provider] || 0;
      const tokens = data.totalTokens || 0;
      estimate[provider] = {
        tokens: tokens,
        cost: (tokens / 1000) * tokenCost,
        calls: data.calls || 0
      };
    });
    
    setCostEstimate(estimate);
  };

  const changePriority = async (newPriority) => {
    const result = await HybridApiService.setPriority(newPriority);
    if (result.success) {
      setPriority(result.newPriority);
      alert('Priority updated successfully!');
    } else {
      alert('Failed to update priority: ' + result.error);
    }
  };

  const presetStrategies = {
    costFirst: ['gemini', 'deepseek', 'openai'],
    qualityFirst: ['openai', 'gemini', 'deepseek'],
    speedFirst: ['gemini', 'openai', 'deepseek'],
    reliabilityFirst: ['openai', 'gemini', 'deepseek'] // All tried in parallel in actual code
  };

  const testProvider = async (providerName) => {
    const result = await HybridApiService.testProvider(providerName);
    alert(result.success 
      ? `${providerName.toUpperCase()} Test Successful!\nResponse: ${result.response.substring(0, 100)}...`
      : `${providerName.toUpperCase()} Test Failed: ${result.error}`
    );
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) return <div className="dashboard-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🤖 Hybrid AI Provider Dashboard</h1>
        <button onClick={loadData} disabled={loading} className="refresh-btn">
          {loading ? 'Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Overview Card */}
        <div className="dashboard-card overview">
          <h2>System Overview</h2>
          {stats && (
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-label">Success Rate</span>
                <span className="stat-value success">{stats.statistics?.successRate || '0%'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Requests</span>
                <span className="stat-value">{stats.statistics?.requests?.total || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Cache Hit Rate</span>
                <span className="stat-value">{stats.statistics?.cache?.hitRate || '0%'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Fallbacks Used</span>
                <span className="stat-value warning">{stats.statistics?.fallbacks || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Provider Status Card */}
        <div className="dashboard-card providers">
          <h2>Provider Status</h2>
          <div className="provider-list">
            {providers.map(provider => (
              <div key={provider} className="provider-item">
                <div className="provider-header">
                  <span className={`provider-status ${stats?.availability?.[provider] ? 'online' : 'offline'}`}>
                    {stats?.availability?.[provider] ? '●' : '○'}
                  </span>
                  <span className="provider-name">{provider.toUpperCase()}</span>
                  <span className="provider-priority">
                    Priority: #{priority.indexOf(provider) + 1}
                  </span>
                </div>
                <div className="provider-stats">
                  <span>Calls: {stats?.statistics?.providers?.[provider]?.calls || 0}</span>
                  <span>Success: {stats?.statistics?.providers?.[provider]?.success || 0}</span>
                  <span>Errors: {stats?.statistics?.providers?.[provider]?.errors || 0}</span>
                </div>
                <div className="provider-actions">
                  <button 
                    className="test-btn"
                    onClick={() => testProvider(provider)}
                    disabled={loading}
                  >
                    Test
                  </button>
                  <span className="response-time">
                    {stats?.statistics?.averageResponseTimes?.[provider] || 0}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Tracking Card */}
        <div className="dashboard-card cost-tracking">
          <h2>Cost Tracking</h2>
          <div className="cost-estimates">
            {Object.entries(costEstimate).map(([provider, data]) => (
              <div key={provider} className="cost-item">
                <span className="cost-provider">{provider.toUpperCase()}</span>
                <div className="cost-details">
                  <span>Calls: {data.calls}</span>
                  <span>Tokens: {data.tokens.toLocaleString()}</span>
                  <span className={`cost-amount ${data.cost === 0 ? 'free' : 'paid'}`}>
                    Cost: ${data.cost.toFixed(4)}
                  </span>
                </div>
                <div className="cost-bar">
                  <div 
                    className="cost-fill"
                    style={{ width: `${Math.min(data.calls * 5, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="total-cost">
            <span>Estimated Total Cost:</span>
            <span className="total-amount">
              ${Object.values(costEstimate).reduce((sum, data) => sum + data.cost, 0).toFixed(4)}
            </span>
          </div>
        </div>

        {/* Priority Control Card */}
        <div className="dashboard-card priority-control">
          <h2>Priority Control</h2>
          <div className="current-priority">
            <h3>Current Priority Order:</h3>
            <div className="priority-list">
              {priority.map((provider, index) => (
                <div key={provider} className="priority-item">
                  <span className="priority-rank">#{index + 1}</span>
                  <span className="priority-provider">{provider.toUpperCase()}</span>
                  <button 
                    className="move-btn"
                    onClick={() => {
                      const newPriority = [...priority];
                      if (index > 0) {
                        [newPriority[index], newPriority[index - 1]] = 
                        [newPriority[index - 1], newPriority[index]];
                        changePriority(newPriority);
                      }
                    }}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button 
                    className="move-btn"
                    onClick={() => {
                      const newPriority = [...priority];
                      if (index < priority.length - 1) {
                        [newPriority[index], newPriority[index + 1]] = 
                        [newPriority[index + 1], newPriority[index]];
                        changePriority(newPriority);
                      }
                    }}
                    disabled={index === priority.length - 1}
                  >
                    ↓
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="preset-strategies">
            <h3>Quick Strategies:</h3>
            <div className="strategy-buttons">
              <button 
                className="strategy-btn cost"
                onClick={() => changePriority(presetStrategies.costFirst)}
              >
                💰 Cost First
              </button>
              <button 
                className="strategy-btn quality"
                onClick={() => changePriority(presetStrategies.qualityFirst)}
              >
                🏆 Quality First
              </button>
              <button 
                className="strategy-btn speed"
                onClick={() => changePriority(presetStrategies.speedFirst)}
              >
                ⚡ Speed First
              </button>
              <button 
                className="strategy-btn reliability"
                onClick={() => changePriority(presetStrategies.reliabilityFirst)}
              >
                🛡️ Reliability First
              </button>
            </div>
          </div>
        </div>

        {/* Cache Management Card */}
        <div className="dashboard-card cache-management">
          <h2>Cache Management</h2>
          {stats && (
            <div className="cache-info">
              <div className="cache-stats">
                <span>Cache Size: {stats.cacheInfo?.size || 0} items</span>
                <span>Hit Rate: {stats.statistics?.cache?.hitRate || '0%'}</span>
                <span>Duration: {stats.cacheInfo?.duration || '300s'}</span>
              </div>
              <div className="cache-actions">
                <button className="clear-cache-btn">
                  🧹 Clear Cache
                </button>
                <span className="cache-hint">
                  Clears all cached responses to force fresh API calls
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="timestamp">
          Last Updated: {stats ? new Date(stats.timestamp).toLocaleTimeString() : 'Never'}
        </div>
        <div className="system-info">
          <span>Hybrid AI System v1.0</span>
          <span>•</span>
          <span>3/3 Providers Operational</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAIDashboard;