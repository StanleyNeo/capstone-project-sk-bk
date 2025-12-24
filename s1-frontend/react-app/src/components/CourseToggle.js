import React, { useState } from 'react';
import config from './config';

axios.get(`${config.apiBaseUrl}/api/schools`)
function CourseToggle() {
  const [courses, setCourses] = useState([
    { id: 1, name: 'React Basics', instructor: 'Sarah Johnson', enrolled: false },
    { id: 2, name: 'Python Fundamentals', instructor: 'Michael Chen', enrolled: false },
    { id: 3, name: 'Data Science 101', instructor: 'Dr. Emily Wilson', enrolled: true },
    { id: 4, name: 'UI/UX Design', instructor: 'Lisa Wang', enrolled: false }
  ]);

  const toggleEnrollment = (id) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, enrolled: !course.enrolled } : course
    ));
  };

  const enrolledCount = courses.filter(c => c.enrolled).length;

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Course Enrollment Manager</h5>
        <p className="card-text">
          Click the toggle button to enroll/unenroll in courses.
          Currently enrolled in {enrolledCount} of {courses.length} courses.
        </p>
        
        <div className="list-group">
          {courses.map(course => (
            <div key={course.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">{course.name}</h6>
                <small className="text-muted">Instructor: {course.instructor}</small>
              </div>
              <button
                className={`btn btn-sm ${course.enrolled ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => toggleEnrollment(course.id)}
              >
                {course.enrolled ? 'Enrolled ✓' : 'Enroll'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-3">
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ width: `${(enrolledCount / courses.length) * 100}%` }}
            >
              {Math.round((enrolledCount / courses.length) * 100)}% Enrolled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseToggle;