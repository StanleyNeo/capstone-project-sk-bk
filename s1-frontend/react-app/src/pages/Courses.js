import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import '../Courses.css';  // ✅ Fixed import path

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    categories: 0,
    students: 0,
    rating: 0
  });

  // Helper functions
  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Data Science': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'AI/ML': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Programming': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Design': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
    };
    return colors[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const getCourseImage = (category) => {
    const images = {
      'Web Development': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop',
      'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
      'AI/ML': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop',
      'Programming': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop',
      'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop'
    };
    return images[category] || 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop';
  };

  // Single fetchCourses function
  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to get courses from port 5000 (MongoDB analytics)
      const response = await ApiService.getCoursesFromAnalytics();
      console.log('Courses API Response (Port 5000):', response);
      
      if (response && response.success && response.data && response.data.length > 0) {
        console.log(`Found ${response.data.length} courses from MongoDB`);
        // Format the courses for display
        const formattedCourses = response.data.map(course => ({
          id: course.courseId || course._id,
          title: course.title || course.name,
          code: course.courseId || 'CRS',
          description: course.description || 'No description available',
          category: course.category || 'General',
          level: course.level || 'Beginner',
          duration: course.duration || '6 weeks',
          rating: course.rating || 4.5,
          students: course.enrolledStudents || 0,
          color: getCategoryColor(course.category),
          imageUrl: getCourseImage(course.category),
          imageAlt: `${course.title || course.name} course`
        }));
        
        setCourses(formattedCourses);
        
        // Calculate stats
        const totalStudents = formattedCourses.reduce((sum, course) => sum + course.students, 0);
        const avgRating = formattedCourses.reduce((sum, course) => sum + course.rating, 0) / formattedCourses.length;
        const categories = [...new Set(formattedCourses.map(c => c.category))];
        
        setStats({
          total: formattedCourses.length,
          categories: categories.length,
          students: totalStudents,
          rating: avgRating.toFixed(1)
        });
      } else {
        // Fallback: Try port 5001 (AI backend)
        console.log('Trying fallback to port 5001...');
        const fallbackResponse = await ApiService.getCourses();
        console.log('Fallback courses response (Port 5001):', fallbackResponse);
        
        if (fallbackResponse && fallbackResponse.data && fallbackResponse.data.length > 0) {
          console.log(`Found ${fallbackResponse.data.length} courses from AI backend`);
          // If response has {success, data} structure
          const formattedCourses = fallbackResponse.data.map(course => ({
            id: course.id,
            title: course.name,
            code: course.code || course.id.toString(),
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration,
            rating: course.rating,
            students: course.students || 0,
            color: getCategoryColor(course.category),
            imageUrl: course.image || getCourseImage(course.category),
            imageAlt: `${course.name} course`
          }));
          
          setCourses(formattedCourses);
          
          // Calculate stats
          const totalStudents = formattedCourses.reduce((sum, course) => sum + course.students, 0);
          const avgRating = formattedCourses.reduce((sum, course) => sum + course.rating, 0) / formattedCourses.length;
          const categories = [...new Set(formattedCourses.map(c => c.category))];
          
          setStats({
            total: formattedCourses.length,
            categories: categories.length,
            students: totalStudents,
            rating: avgRating.toFixed(1)
          });
        } else if (fallbackResponse && Array.isArray(fallbackResponse) && fallbackResponse.length > 0) {
          // If response is already an array (for backward compatibility)
          console.log(`Found ${fallbackResponse.length} courses from array response`);
          const formattedCourses = fallbackResponse.map(course => ({
            id: course.id,
            title: course.name,
            code: course.code || course.id.toString(),
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration,
            rating: course.rating,
            students: course.students || 0,
            color: getCategoryColor(course.category),
            imageUrl: course.image || getCourseImage(course.category),
            imageAlt: `${course.name} course`
          }));
          
          setCourses(formattedCourses);
          
          // Calculate stats
          const totalStudents = formattedCourses.reduce((sum, course) => sum + course.students, 0);
          const avgRating = formattedCourses.reduce((sum, course) => sum + course.rating, 0) / formattedCourses.length;
          const categories = [...new Set(formattedCourses.map(c => c.category))];
          
          setStats({
            total: formattedCourses.length,
            categories: categories.length,
            students: totalStudents,
            rating: avgRating.toFixed(1)
          });
        } else {
          // Use sample data
          console.log('Using sample data as fallback');
          throw new Error('No courses available from backend');
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Could not load courses. Using sample data.');
      
      // Use sample data as last resort
      const sampleCourses = [
        {
          id: 1,
          title: "React for Beginners",
          code: "RfB",
          description: "Learn React.js from scratch. Build modern web applications with reusable components.",
          category: "Web Development",
          level: "Beginner",
          duration: "6 weeks",
          rating: 4.7,
          students: 120,
          color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
          imageAlt: "React.js code on screen"
        },
        {
          id: 2,
          title: "Introduction to Data Science",
          code: "ItDS",
          description: "Master data analysis, visualization, and machine learning fundamentals.",
          category: "Data Science",
          level: "Intermediate",
          duration: "8 weeks",
          rating: 4.8,
          students: 85,
          color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
          imageAlt: "Data science visualization"
        }
      ];
      
      setCourses(sampleCourses);
      setStats({
        total: sampleCourses.length,
        categories: 2,
        students: 205,
        rating: "4.75"
      });
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to fetch on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const handleImageError = (e, course) => {
    e.target.style.display = 'none';
    e.target.parentElement.style.background = course.color;
    e.target.parentElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 48px;
        font-weight: bold;
        width: 100%;
        height: 100%;
      ">
        ${course.code}
      </div>
    `;
  };

  const refreshCourses = () => {
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading courses...</span>
          </div>
          <p className="mt-2">Loading courses from backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-body text-center">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="display-4 mb-3">
                    <i className="fas fa-book text-primary me-3"></i>
                    Available Courses
                  </h1>
                  <p className="lead">
                    Explore our AI-powered courses designed for all skill levels
                  </p>
                </div>
                <button className="btn btn-primary" onClick={refreshCourses}>
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </button>
              </div>
              
              {error && (
                <div className="alert alert-warning mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <div className="d-flex justify-content-center gap-3 mt-3">
                <Link to="/ai-features" className="btn btn-primary">
                  <i className="fas fa-robot me-2"></i>
                  Try AI Features
                </Link>
                <button className="btn btn-outline-primary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                  <i className="fas fa-arrow-down me-2"></i>
                  Browse All Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="row mt-4">
        <div className="col-md-3 mb-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body py-4">
              <div className="display-4 text-primary mb-2">
                <i className="fas fa-book-open"></i>
              </div>
              <h3 className="card-title">{stats.total}</h3>
              <p className="card-text text-muted">Total Courses</p>
              <small className="text-info">
                <i className="fas fa-database me-1"></i>
                {courses.length > 2 ? 'From MongoDB' : 'Sample Data'}
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body py-4">
              <div className="display-4 text-success mb-2">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="card-title">
                {stats.students.toLocaleString()}
              </h3>
              <p className="card-text text-muted">Total Students</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body py-4">
              <div className="display-4 text-warning mb-2">
                <i className="fas fa-star"></i>
              </div>
              <h3 className="card-title">
                {stats.rating}
              </h3>
              <p className="card-text text-muted">Avg Rating</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body py-4">
              <div className="display-4 text-info mb-2">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3 className="card-title">
                {stats.categories}
              </h3>
              <p className="card-text text-muted">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="row">
        <div className="col-12">
          <h3 className="mb-4">
            <i className="fas fa-graduation-cap me-2"></i>
            Featured Courses ({courses.length})
          </h3>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No courses found. Please check if the backend servers are running.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {courses.map((course) => (
            <div className="col" key={course.id}>
              <div className="card h-100 shadow-sm course-card">
                {/* Course Image with Overlay */}
                <div className="card-img-top position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                  <img 
                    src={course.imageUrl} 
                    alt={course.imageAlt}
                    className="img-fluid w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => handleImageError(e, course)}
                    loading="lazy"
                  />
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-dark bg-opacity-75 px-3 py-2" style={{ fontSize: '1.2rem' }}>
                      {course.code}
                    </span>
                  </div>
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <span className="badge bg-primary px-3 py-2">
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{course.title}</h5>
                    <span className="badge bg-warning text-dark">
                      <i className="fas fa-star me-1"></i>
                      {course.rating}
                    </span>
                  </div>
                  
                  <p className="card-text text-muted">{course.description}</p>
                  
                  <div className="course-meta mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-secondary me-2">
                          <i className="fas fa-signal me-1"></i>
                          {course.level}
                        </span>
                        <span className="badge bg-info">
                          <i className="fas fa-clock me-1"></i>
                          {course.duration}
                        </span>
                      </div>
                      <div className="text-muted">
                        <i className="fas fa-users me-1"></i>
                        {course.students}
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-light text-dark border">
                        <i className="fas fa-play-circle me-1"></i>
                        Includes Projects
                      </span>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-primary">
                        <i className="fas fa-info-circle me-1"></i>
                        Details
                      </button>
                      <button className="btn btn-sm btn-outline-primary ms-2">
                        <i className="fas fa-play-circle me-1"></i>
                        Enroll
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backend Status */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-server me-2"></i>Backend Status</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`badge ${courses.length > 2 ? 'bg-success' : 'bg-warning'} me-3`} style={{ width: '20px', height: '20px', borderRadius: '50%' }}></div>
                    <div>
                      <strong>Port 5001 (AI & Courses)</strong>
                      <p className="mb-0">Status: {courses.length > 2 ? 'Connected' : 'Using sample data'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <div className="badge bg-success me-3" style={{ width: '20px', height: '20px', borderRadius: '50%' }}></div>
                    <div>
                      <strong>Port 5000 (Analytics)</strong>
                      <p className="mb-0">Status: Connected (for search & analytics)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;