// Create: s3-database/MongoDB-Backend/simple-cors-server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins (for development)
app.use(cors());
app.use(express.json());

// Mock endpoints for testing
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', port: 5000 });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      users: 10,
      courses: 10,
      enrollments: 15,
      database: "mongodb",
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/analytics/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totals: { users: 10, courses: 10, enrollments: 15 },
      metrics: { completionRate: 20, activeRatio: 70 },
      distribution: {
        users: { students: 7, instructors: 2, admins: 1 },
        categories: [
          { _id: "Web Development", count: 3, totalEnrolled: 120 },
          { _id: "Data Science", count: 2, totalEnrolled: 60 }
        ]
      },
      recentEnrollments: [
        { userName: "John Smith", courseTitle: "Web Development", status: "active", progress: 65 },
        { userName: "Sarah Johnson", courseTitle: "Python", status: "completed", progress: 100 }
      ],
      topCourses: [
        { title: "Web Development", enrolledStudents: 45 },
        { title: "Data Science", enrolledStudents: 32 }
      ]
    }
  });
});

app.listen(5000, () => {
  console.log('CORS-enabled server running on http://localhost:5000');
  console.log('CORS configured for all origins');
});