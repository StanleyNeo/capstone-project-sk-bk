
---

## **SECTION 3: DATABASE**

### **3.1 MySQL Queries**

**File:** `SECTION3-DATABASE/MySQL-Queries/mysql_queries.sql`
```sql
-- Task 1: Create instructors table
CREATE TABLE instructors (
  instructor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- Insert sample records
INSERT INTO instructors (name, email) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@lms.com'),
('Prof. Michael Chen', 'michael.chen@lms.com'),
('Ms. Emily Wilson', 'emily.wilson@lms.com');

-- Task 2: Add user and enroll
-- Add new user
INSERT INTO users (name, email, password) 
VALUES ('Daniel Rose', 'daniel@lms.com', 'daniel123');

-- Enroll in CSS Design (course_id 2)
INSERT INTO enrollments (user_id, course_id, enrollment_date) 
VALUES (
  (SELECT user_id FROM users WHERE email = 'daniel@lms.com'),
  2,
  CURDATE()
);

-- Show all users in CSS Design
SELECT u.name, u.email, c.course_name, e.enrollment_date
FROM users u
JOIN enrollments e ON u.user_id = e.user_id
JOIN courses c ON e.course_id = c.course_id
WHERE c.course_name = 'CSS Design';