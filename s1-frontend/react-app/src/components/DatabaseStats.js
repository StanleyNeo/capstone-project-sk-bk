import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

function DatabaseStats() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    enrollments: 0,
    loading: true
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [userDistribution, setUserDistribution] = useState({});
  const [categories, setCategories] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    loadDatabaseStats();
  }, []);

const loadDatabaseStats = async () => {
  console.log('🔄 Loading database stats...');
  setStats(prev => ({ ...prev, loading: true }));
  setError('');
  setBackendStatus('loading');
  
  try {
    // Try to get analytics summary first
    const data = await ApiService.getAnalyticsSummary();
    console.log('📊 Analytics Summary Data (RAW):', data);
    
    if (data && data.success) {
      console.log('✅ Analytics endpoint successful');
      
      // Check if we have the full analytics data structure
      if (data.data && data.data.totals) {
        // Full analytics structure exists
        const analytics = data.data;
        
        setBackendStatus('connected');
        
        // Extract data from the analytics structure
        setStats({
          users: analytics.totals.users || 0,
          courses: analytics.totals.courses || 0,
          enrollments: analytics.totals.enrollments || 0,
          loading: false
        });
        
        // Set other analytics data
        setRecentEnrollments(analytics.recentEnrollments || []);
        setTopCourses(analytics.topCourses || []);
        setUserDistribution(analytics.distribution?.users || { students: 0, instructors: 0, admins: 0 });
        setCategories(analytics.distribution?.categories || []);
        setMetrics(analytics.metrics || {});
        
      } else if (data.data) {
        // Direct data structure (without nesting)
        console.log('⚠️ Using direct data structure (without analytics.totals)');
        
        setBackendStatus('connected');
        
        // Extract data directly
        setStats({
          users: data.data.users || data.data.totalUsers || 0,
          courses: data.data.courses || data.data.totalCourses || 0,
          enrollments: data.data.enrollments || data.data.totalEnrollments || 0,
          loading: false
        });
        
        // Try to get other data
        setRecentEnrollments(data.data.recentEnrollments || []);
        setTopCourses(data.data.topCourses || []);
        
        // Try to calculate user distribution from available data
        if (data.data.usersByType) {
          setUserDistribution(data.data.usersByType);
        } else {
          // Calculate user distribution from enrollments
          await calculateUserDistributionFromData();
        }
        
        // Calculate metrics if not provided
        if (!data.data.metrics) {
          await calculateMetricsFromData();
        } else {
          setMetrics(data.data.metrics);
        }
        
      } else {
        // Empty data structure
        console.log('⚠️ Analytics returned empty data structure');
        setBackendStatus('partial');
        await loadFallbackData();
      }
    } else {
      // Analytics endpoint failed
      console.log('🔄 Analytics endpoint failed, trying fallback...');
      await loadFallbackData();
    }
  } catch (error) {
    console.error('❌ Failed to load database stats:', error);
    setError(`Failed to load analytics: ${error.message}`);
    setBackendStatus('error');
    setStats(prev => ({ ...prev, loading: false }));
    
    // Try basic stats as last resort
    tryBasicStatsFallback();
  }
};

// New helper functions
const calculateUserDistributionFromData = async () => {
  try {
    // Try to get users from API
    const usersResponse = await ApiService.getUsers();
    if (usersResponse.success && Array.isArray(usersResponse.data)) {
      const users = usersResponse.data;
      
      // Count user types (assuming role field exists)
      const distribution = {
        students: users.filter(u => u.role === 'student' || u.userType === 'student').length,
        instructors: users.filter(u => u.role === 'instructor' || u.userType === 'instructor').length,
        admins: users.filter(u => u.role === 'admin' || u.userType === 'admin').length
      };
      
      setUserDistribution(distribution);
    } else {
      // Fallback: Estimate from enrollments data
      const enrollmentsResponse = await ApiService.getEnrollments();
      if (enrollmentsResponse.success && Array.isArray(enrollmentsResponse.data)) {
        const enrollments = enrollmentsResponse.data;
        
        // Count unique users and guess their types based on patterns
        const uniqueUserIds = [...new Set(enrollments.map(e => e.userId))];
        
        // Simple heuristic: users starting with "STU" are students, "INS" are instructors
        const distribution = {
          students: uniqueUserIds.filter(id => id.startsWith('STU')).length,
          instructors: uniqueUserIds.filter(id => id.startsWith('INS')).length,
          admins: uniqueUserIds.filter(id => id.startsWith('ADM')).length || 1 // At least 1 admin
        };
        
        setUserDistribution(distribution);
      }
    }
  } catch (error) {
    console.warn('Could not calculate user distribution:', error);
    setUserDistribution({ students: 0, instructors: 0, admins: 0 });
  }
};

const calculateMetricsFromData = async () => {
  try {
    const enrollmentsResponse = await ApiService.getEnrollments();
    if (enrollmentsResponse.success && Array.isArray(enrollmentsResponse.data)) {
      const enrollments = enrollmentsResponse.data;
      
      const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const totalEnrollments = enrollments.length;
      
      const metrics = {
        completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
        activeRatio: totalEnrollments > 0 ? Math.round((activeEnrollments / totalEnrollments) * 100) : 0,
        averageEnrollments: 0
      };
      
      setMetrics(metrics);
    }
  } catch (error) {
    console.warn('Could not calculate metrics:', error);
    setMetrics({});
  }
};

const loadFallbackData = async () => {
  try {
    console.log('🔄 Loading fallback data from multiple endpoints...');
    
    // Get basic stats
    const statsRes = await ApiService.getStats();
    if (statsRes.success) {
      setStats({
        users: statsRes.data.users || 0,
        courses: statsRes.data.courses || 0,
        enrollments: statsRes.data.enrollments || 0,
        loading: false
      });
      
      setBackendStatus('partial');
      
      // Get additional data
      const enrollmentsRes = await ApiService.getEnrollments();
      if (enrollmentsRes.success) {
        // Get recent enrollments (last 5)
        const recent = enrollmentsRes.data.slice(0, 5);
        setRecentEnrollments(recent);
        
        // Calculate metrics
        const activeEnrollments = enrollmentsRes.data.filter(e => e.status === 'active').length;
        const completedEnrollments = enrollmentsRes.data.filter(e => e.status === 'completed').length;
        const totalEnrollments = enrollmentsRes.data.length;
        
        setMetrics({
          completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
          activeRatio: totalEnrollments > 0 ? Math.round((activeEnrollments / totalEnrollments) * 100) : 0
        });
      }
      
      // Get courses for categories
      const coursesRes = await ApiService.getCoursesFromAnalytics();
      if (coursesRes.success) {
        // Calculate categories
        const categoryMap = {};
        coursesRes.data.forEach(course => {
          const category = course.category || 'Uncategorized';
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        });
        
        const categories = Object.entries(categoryMap).map(([name, count]) => ({
          _id: name,
          count: count,
          totalEnrolled: coursesRes.data.filter(c => c.category === name)
            .reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)
        }));
        
        setCategories(categories);
        
        // Set top courses (by enrolledStudents)
        const topCourses = [...coursesRes.data]
          .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
          .slice(0, 5);
        
        setTopCourses(topCourses);
      }
      
      // Calculate user distribution
      await calculateUserDistributionFromData();
      
    } else {
      throw new Error('Basic stats failed');
    }
  } catch (error) {
    console.error('❌ Fallback data failed:', error);
    setBackendStatus('error');
    setError('All data sources failed. Please check backend connections.');
  }
};

const tryBasicStatsFallback = async () => {
  console.log('🔄 Trying basic stats fallback...');
  try {
    const statsRes = await ApiService.getStats();
    if (statsRes && statsRes.success) {
      console.log('✅ Basic stats received:', statsRes);
      setStats({
        users: statsRes.data.users || 0,
        courses: statsRes.data.courses || 0,
        enrollments: statsRes.data.enrollments || 0,
        loading: false
      });
      setBackendStatus('partial');
      setError(''); // Clear error since we got some data
    } else {
      throw new Error('Basic stats also failed');
    }
  } catch (fallbackError) {
    console.error('❌ All fallbacks failed:', fallbackError);
    setError('All backend connections failed. Please check if MongoDB backend is running.');
  }
};

  const tryFallback = async () => {
    console.log('🔄 Trying basic stats fallback...');
    try {
      const statsRes = await ApiService.getStats();
      if (statsRes && statsRes.success) {
        console.log('✅ Basic stats received:', statsRes);
        setStats({
          users: statsRes.data?.users || 0,
          courses: statsRes.data?.courses || 0,
          enrollments: statsRes.data?.enrollments || 0,
          loading: false
        });
        setBackendStatus('partial');
        setError(''); // Clear error since we got some data
      } else {
        throw new Error('Basic stats also failed');
      }
    } catch (fallbackError) {
      console.error('❌ All fallbacks failed:', fallbackError);
      setError('All backend connections failed. Please check if MongoDB backend is running.');
    }
  };

  const getEnrollmentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'dropped': return 'danger';
      default: return 'secondary';
    }
  };

  const calculatePercentage = (part, total) => {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  // Calculate completion rate from metrics
  const completionRate = metrics.completionRate || 0;
  
  // Calculate active enrollments from metrics
  const activeEnrollments = metrics.activeRatio ? 
    Math.round((stats.enrollments * metrics.activeRatio) / 100) : 
    (recentEnrollments.filter(e => e.status === 'active').length);

  if (stats.loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading database stats...</span>
          </div>
          <p className="mt-2">
            Loading database statistics from backend...
            <br />
            <small className="text-muted">
              Status: {backendStatus === 'checking' ? 'Checking connection...' : 'Loading data...'}
            </small>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-lg">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title mb-0">📊 Database Analytics Dashboard</h5>
          <small className="opacity-75">
            {backendStatus === 'connected' ? '✅ Connected to MongoDB' : 
             backendStatus === 'partial' ? '⚠️ Partial connection' : 
             '❌ Connection failed'}
          </small>
        </div>
        <div>
          <button 
            className="btn btn-sm btn-light me-2"
            onClick={loadDatabaseStats}
            title="Refresh data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      <div className="card-body">
        
        {error && (
          <div className="alert alert-warning mb-3">
            <strong>⚠️ Warning:</strong> {error}
            <div className="mt-2">
              <small>
                Backend: <a href="http://localhost:5000" target="_blank" rel="noreferrer">http://localhost:5000</a> | 
                Check if MongoDB Analytics Backend is running.
              </small>
            </div>
          </div>
        )}

        {/* Summary Cards - FIXED TO SHOW REAL DATA */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-primary h-100">
              <div className="card-body text-center">
                <div className="display-6 text-primary">{stats.users}</div>
                <div className="card-title">Total Users</div>
                <div className="small text-muted">
                  Students: {userDistribution.students || 0} | 
                  Instructors: {userDistribution.instructors || 0} | 
                  Admins: {userDistribution.admins || 0}
                </div>
                <div className="mt-2 small">
                  <span className={`badge ${backendStatus === 'connected' ? 'bg-success' : 'bg-warning'}`}>
                    {backendStatus === 'connected' ? 'Live Data' : 'Partial'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card border-success h-100">
              <div className="card-body text-center">
                <div className="display-6 text-success">{stats.courses}</div>
                <div className="card-title">Courses</div>
                <div className="small text-muted">
                  {categories.length} categories | 
                  {metrics.averageEnrollments ? ` ${metrics.averageEnrollments} avg enrollment` : ' 0 avg enrollment'}
                </div>
                <div className="mt-2 small">
                  {stats.courses === 0 ? (
                    <span className="badge bg-danger">No courses found</span>
                  ) : (
                    <span className="badge bg-success">{stats.courses} courses loaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card border-warning h-100">
              <div className="card-body text-center">
                <div className="display-6 text-warning">{stats.enrollments}</div>
                <div className="card-title">Enrollments</div>
                <div className="small text-muted">
                  Active: {activeEnrollments} | 
                  Completed: {recentEnrollments.filter(e => e.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card border-info h-100">
              <div className="card-body text-center">
                <div className="display-6 text-info">{completionRate}%</div>
                <div className="card-title">Completion Rate</div>
                <div className="small text-muted">
                  {recentEnrollments.filter(e => e.status === 'completed').length} students completed courses
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">👥 User Distribution</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <div className="p-3">
                      <div className="text-primary fs-3">{userDistribution.students || 0}</div>
                      <small className="text-muted">Students</small>
                      <div className="small">
                        {calculatePercentage(userDistribution.students || 0, stats.users)}%
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3">
                      <div className="text-warning fs-3">{userDistribution.instructors || 0}</div>
                      <small className="text-muted">Instructors</small>
                      <div className="small">
                        {calculatePercentage(userDistribution.instructors || 0, stats.users)}%
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3">
                      <div className="text-danger fs-3">{userDistribution.admins || 0}</div>
                      <small className="text-muted">Admins</small>
                      <div className="small">
                        {calculatePercentage(userDistribution.admins || 0, stats.users)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enrollment Status - Simplified */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">🎯 Enrollment Status</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-12">
                    <div className="p-3">
                      <div className="fs-3 text-primary">{activeEnrollments}</div>
                      <small className="text-muted">Active Enrollments</small>
                      <div className="small">
                        {metrics.activeRatio ? `${Math.round(metrics.activeRatio)}%` : '0%'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Courses */}
        {topCourses.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">🏆 Top Courses</h6>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {topCourses.slice(0, 5).map((course, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{course.title}</strong>
                            <div className="small text-muted">
                              {course.category} • {course.duration} • ⭐ {course.rating}
                            </div>
                          </div>
                          <span className="badge bg-primary">
                            {course.enrolledStudents} students
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Enrollments */}
        {recentEnrollments.length > 0 ? (
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">📝 Recent Enrollments</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Enrolled At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.map((enrollment, index) => (
                      <tr key={index}>
                        <td>{enrollment.userName}</td>
                        <td>{enrollment.courseTitle}</td>
                        <td>
                          <span className={`badge bg-${getEnrollmentStatusColor(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                            <small>{enrollment.progress}%</small>
                          </div>
                        </td>
                        <td>
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-info mb-4">
            <i className="fas fa-info-circle me-2"></i>
            No recent enrollments found. {backendStatus === 'error' ? 'Backend connection issue.' : 'Try refreshing.'}
          </div>
        )}

        {/* Course Categories */}
        {categories.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">📚 Course Categories</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {categories.map((category, index) => (
                  <div className="col-md-4 mb-3" key={index}>
                    <div className="card border-secondary h-100">
                      <div className="card-body">
                        <h6 className="card-title">{category._id}</h6>
                        <div className="d-flex justify-content-between">
                          <div>
                            <span className="badge bg-secondary">
                              {category.count} courses
                            </span>
                          </div>
                          <div>
                            <span className="badge bg-info">
                              {category.totalEnrolled} students
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 small text-muted">
                          Avg: {Math.round(category.totalEnrolled / category.count)} students per course
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              <small>
                Backend: <a href="http://localhost:5000" target="_blank" rel="noreferrer">Port 5000</a>
                <br />
                Status: <span className={`badge ${backendStatus === 'connected' ? 'bg-success' : 'bg-warning'}`}>
                  {backendStatus}
                </span>
              </small>
            </div>
            <div className="text-end">
              <small className="text-muted">
                Last updated: {new Date().toLocaleString()}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseStats;