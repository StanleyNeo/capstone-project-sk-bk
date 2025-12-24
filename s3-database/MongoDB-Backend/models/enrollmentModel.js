const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  enrollmentDate: { type: Date, default: Date.now },

  // 🔹 Added for frontend compatibility (not in raw data, but UI needs them)
  userId: { type: String },        // e.g., "STU001"
  userName: { type: String },      // alias for studentName
  courseTitle: { type: String },   // populated later
  status: { 
    type: String, 
    enum: ['active', 'completed', 'dropped'], 
    default: 'active' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);