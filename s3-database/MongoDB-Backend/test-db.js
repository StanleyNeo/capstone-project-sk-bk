const mongoose = require('mongoose');

async function testDatabase() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/lms_analytics', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔍 Testing Database Connection...\n');

    // Define models
    const User = mongoose.model('User', new mongoose.Schema({}));
    const Course = mongoose.model('Course', new mongoose.Schema({}));
    const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}));

    // Count documents
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();

    console.log('📊 DATABASE STATISTICS:');
    console.log(`   👥 Total Users: ${userCount}`);
    console.log(`   📚 Total Courses: ${courseCount}`);
    console.log(`   🎯 Total Enrollments: ${enrollmentCount}`);

    if (userCount > 0) {
      const students = await User.countDocuments({ role: 'student' });
      const instructors = await User.countDocuments({ role: 'instructor' });
      const admins = await User.countDocuments({ role: 'admin' });
      
      console.log('\n👥 USER DISTRIBUTION:');
      console.log(`   Students: ${students}`);
      console.log(`   Instructors: ${instructors}`);
      console.log(`   Admins: ${admins}`);
    }

    if (enrollmentCount > 0) {
      const active = await Enrollment.countDocuments({ status: 'active' });
      const completed = await Enrollment.countDocuments({ status: 'completed' });
      const dropped = await Enrollment.countDocuments({ status: 'dropped' });
      const completionRate = Math.round((completed / enrollmentCount) * 100);
      
      console.log('\n🎯 ENROLLMENT STATISTICS:');
      console.log(`   Active: ${active}`);
      console.log(`   Completed: ${completed}`);
      console.log(`   Dropped: ${dropped}`);
      console.log(`   Completion Rate: ${completionRate}%`);
    }

    if (courseCount > 0) {
      const categories = await Course.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      console.log('\n📚 COURSE CATEGORIES:');
      categories.forEach(cat => {
        console.log(`   ${cat._id}: ${cat.count} courses`);
      });
    }

    console.log('\n✅ Database test completed successfully!');
    
    // Get sample data
    console.log('\n📋 SAMPLE DATA:');
    const sampleUser = await User.findOne();
    console.log(`   Sample User: ${sampleUser?.name} (${sampleUser?.email})`);
    
    const sampleCourse = await Course.findOne();
    console.log(`   Sample Course: ${sampleCourse?.title}`);
    
    const sampleEnrollment = await Enrollment.findOne();
    console.log(`   Sample Enrollment: ${sampleEnrollment?.userName} → ${sampleEnrollment?.courseTitle}`);

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database.');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();