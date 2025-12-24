import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

function Dashboard() {
  const [userCourses, setUserCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    users: 0, 
    courses: 0, 
    enrollments: 0 
  });
  
  const [currentUser] = useState({
    id: 'STU001',
    name: 'John Smith',
    email: 'john@example.com'
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Loading dashboard data for user:', currentUser.id);
        
        // ========== 1. Get Dashboard Statistics ==========
        const statsResponse = await ApiService.getStats();
        console.log('Stats response:', statsResponse);
        
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
        
        // ========== 2. Get User Enrollments ==========
        const enrollmentsResponse = await ApiService.getEnrollments();
        console.log('Enrollments response:', enrollmentsResponse);
        
        if (enrollmentsResponse.success && Array.isArray(enrollmentsResponse.data)) {
          // Filter enrollments by current user
          const userEnrollments = enrollmentsResponse.data.filter(
            enrollment => enrollment.userId === currentUser.id
          );
          
          console.log('User enrollments:', userEnrollments);
          
          // Format enrollments for display
          const formattedEnrollments = userEnrollments.map(enrollment => ({
            courseId: enrollment.courseId,
            courseTitle: enrollment.courseTitle,
            progress: enrollment.progress,
            status: enrollment.status,
            enrolledDate: enrollment.enrolledAt 
              ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Unknown'
          }));
          
          setUserCourses(formattedEnrollments);
        }
        
        // ========== 3. Get Available Courses ==========
        const coursesResponse = await ApiService.getCoursesFromAnalytics();
        console.log('Courses response:', coursesResponse);
        
        if (coursesResponse.success && Array.isArray(coursesResponse.data)) {
          // Get enrolled course IDs to filter them out
          const enrolledCourseIds = userCourses.map(course => course.courseId);
          
          // Format courses and filter out already enrolled courses
          const formattedCourses = coursesResponse.data
            .map(course => ({
              courseId: course.courseId, // Use courseId not _id
              title: course.title,
              description: course.description,
              category: course.category,
              level: course.level,
              instructor: course.instructor,
              rating: course.rating,
              enrolledStudents: course.enrolledStudents,
              price: course.price,
              duration: course.duration
            }))
            .filter(course => !enrolledCourseIds.includes(course.courseId))
            .slice(0, 6); // Show only 6 courses
          
          setAvailableCourses(formattedCourses);
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Set fallback data
        setStats({ users: 10, courses: 10, enrollments: 15 });
        
        setUserCourses([
          { 
            courseId: 'WEB101', 
            courseTitle: 'Web Development Fundamentals', 
            progress: 100, 
            status: 'completed',
            enrolledDate: 'Dec 12, 2024'
          },
          { 
            courseId: 'DS201', 
            courseTitle: 'Data Science with Python', 
            progress: 65, 
            status: 'active',
            enrolledDate: 'Dec 12, 2024'
          },
          { 
            courseId: 'AI301', 
            courseTitle: 'Machine Learning Fundamentals', 
            progress: 30, 
            status: 'active',
            enrolledDate: 'Dec 12, 2024'
          }
        ]);
        
        setAvailableCourses([
          { 
            courseId: 'DES101', 
            title: 'UI/UX Design Principles', 
            description: 'Master user interface design',
            category: 'Design',
            level: 'Beginner'
          },
          { 
            courseId: 'PYT101', 
            title: 'Python Programming', 
            description: 'Python from basics to advanced',
            category: 'Programming',
            level: 'Beginner'
          },
          { 
            courseId: 'REA201', 
            title: 'React for Beginners', 
            description: 'Learn React framework',
            category: 'Web Development',
            level: 'Intermediate'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser.id]);

  // Handle course enrollment
  const handleEnroll = async (courseId, courseTitle) => {
    try {
      const result = await ApiService.enrollCourse(currentUser.id, courseId);
      
      if (result.success) {
        alert(`Successfully enrolled in ${courseTitle}!`);
        
        // Add to user courses
        setUserCourses(prev => [...prev, {
          courseId,
          courseTitle,
          progress: 0,
          status: 'active',
          enrolledDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }]);
        
        // Remove from available courses
        setAvailableCourses(prev => prev.filter(course => course.courseId !== courseId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          enrollments: prev.enrollments + 1
        }));
      } else {
        alert(`Failed to enroll: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  // Handle progress update
  const handleProgress = async (courseId, courseTitle) => {
    const newProgress = Math.min(100, (userCourses.find(c => c.courseId === courseId)?.progress || 0) + 10);
    
    // Update local state
    setUserCourses(prev => 
      prev.map(course => 
        course.courseId === courseId 
          ? { ...course, progress: newProgress }
          : course
      )
    );
    
    alert(`Progress updated for ${courseTitle}: ${newProgress}%`);
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">
        <i className="fas fa-graduation-cap me-2"></i>
        Learning Dashboard
      </h1>
      
      {/* Welcome Message */}
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <i className="fas fa-user-circle fa-2x me-3"></i>
          <div>
            <h5 className="mb-1">Welcome back, {currentUser.name}!</h5>
            <p className="mb-0">User ID: {currentUser.id} • Email: {currentUser.email}</p>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h1 className="display-4 text-primary">{stats.users || 0}</h1>
              <p className="card-text">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h1 className="display-4 text-success">{stats.courses || 0}</h1>
              <p className="card-text">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h1 className="display-4 text-warning">{stats.enrollments || 0}</h1>
              <p className="card-text">Total Enrollments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h1 className="display-4 text-info">{userCourses.length}</h1>
              <p className="card-text">My Enrollments</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="fas fa-book-open me-2"></i>
            My Courses ({userCourses.length})
          </h4>
          <small>Average Progress: {userCourses.length > 0 
            ? Math.round(userCourses.reduce((sum, c) => sum + c.progress, 0) / userCourses.length)
            : 0}%</small>
        </div>
        <div className="card-body">
          {userCourses.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-book fa-3x text-muted mb-3"></i>
              <h5>You haven't enrolled in any courses yet.</h5>
              <p className="text-muted">Browse available courses below to get started!</p>
              <a href="/courses" className="btn btn-primary">
                <i className="fas fa-search me-2"></i>
                Browse Courses
              </a>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Course Title</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Enrolled Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userCourses.map((course, index) => (
                    <tr key={index}>
                      <td>
                        <code>{course.courseId}</code>
                      </td>
                      <td>
                        <strong>{course.courseTitle}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
                            <div 
                              className={`progress-bar ${course.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                              role="progressbar" 
                              style={{ width: `${course.progress}%` }}
                              aria-valuenow={course.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {course.progress}%
                            </div>
                          </div>
                          <span>{course.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${course.status === 'completed' ? 'success' : course.status === 'active' ? 'info' : course.status === 'dropped' ? 'danger' : 'secondary'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td>
                        <small>{course.enrolledDate}</small>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleProgress(course.courseId, course.courseTitle)}
                          disabled={course.progress === 100}
                        >
                          <i className="fas fa-plus me-1"></i>
                          Update Progress
                        </button>
                        {course.progress === 100 && (
                          <span className="badge bg-success">
                            <i className="fas fa-check me-1"></i>
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Available Courses Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">
            <i className="fas fa-bookmark me-2"></i>
            Available Courses ({availableCourses.length})
          </h4>
        </div>
        <div className="card-body">
          {availableCourses.length === 0 ? (
            <div className="alert alert-success">
              <i className="fas fa-check-circle me-2"></i>
              You're enrolled in all available courses! Great job!
            </div>
          ) : (
            <div className="row">
              {availableCourses.map((course, index) => (
                <div className="col-md-4 mb-3" key={index}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <div className="mb-2">
                        <span className="badge bg-primary">{course.courseId}</span>
                      </div>
                      <h6 className="card-title">{course.title}</h6>
                      <p className="card-text small text-muted flex-grow-1">
                        {course.description}
                      </p>
                      <div className="mb-3">
                        <span className="badge bg-info me-1">{course.category}</span>
                        <span className="badge bg-secondary me-1">{course.level}</span>
                        {course.rating && (
                          <span className="badge bg-warning">
                            <i className="fas fa-star me-1"></i>
                            {course.rating}
                          </span>
                        )}
                        {course.enrolledStudents > 0 && (
                          <span className="badge bg-success mt-1 d-inline-block">
                            <i className="fas fa-users me-1"></i>
                            {course.enrolledStudents} enrolled
                          </span>
                        )}
                      </div>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">
                            <i className="fas fa-user me-1"></i>
                            {course.instructor}
                          </small>
                          <small className="text-success fw-bold">
                            ${course.price}
                          </small>
                        </div>
                        <button 
                          className="btn btn-success w-100"
                          onClick={() => handleEnroll(course.courseId, course.title)}
                        >
                          <i className="fas fa-plus-circle me-2"></i>
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <i className="fas fa-chart-line me-2"></i>
            Learning Progress Summary
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Course Completion</h6>
              {userCourses.map((course, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{course.courseTitle}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress">
                    <div 
                      className={`progress-bar ${course.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-6">
              <h6>Quick Stats</h6>
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Completed Courses</span>
                  <span className="badge bg-success">
                    {userCourses.filter(c => c.progress === 100).length}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Active Courses</span>
                  <span className="badge bg-info">
                    {userCourses.filter(c => c.progress < 100 && c.status === 'active').length}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total Learning Hours</span>
                  <span className="badge bg-warning">42 hrs</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Certificates Earned</span>
                  <span className="badge bg-primary">1</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;