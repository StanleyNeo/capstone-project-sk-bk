// MongoDB Compass Commands

// Insert new school
db.schools.insertOne({
  "name": "Tech Valley High School",
  "address": "789 Innovation Drive, Tech City",
  "principal": "Dr. Robert Martinez"
});

// Find all schools
db.schools.find({});

// Find schools by principal
db.schools.find({ "principal": "Dr. Robert Martinez" });