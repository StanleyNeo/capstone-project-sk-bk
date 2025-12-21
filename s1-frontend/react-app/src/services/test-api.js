import ApiService from './services/api';

async function testAllEndpoints() {
  console.log('🧪 Testing All API Endpoints...\n');
  
  const tests = [
    { name: 'Port 5000 - Search Health', test: () => ApiService.getSearchHealth() },
    { name: 'Port 5000 - Stats', test: () => ApiService.getStats() },
    { name: 'Port 5000 - Analytics Summary', test: () => ApiService.getAnalyticsSummary() },
    { name: 'Port 5000 - Users', test: () => ApiService.getUsers() },
    { name: 'Port 5000 - Courses', test: () => ApiService.getCoursesFromAnalytics() },
    { name: 'Port 5000 - Search Courses', test: () => ApiService.searchCourses('web') },
    { name: 'Port 5001 - AI Providers', test: () => ApiService.getAiProviders() },
    { name: 'Port 5001 - Courses', test: () => ApiService.getCourses() },
    { name: 'Port 5001 - AI Chat', test: () => ApiService.sendChatMessage('Hello') },
  ];

  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(`${result.success ? '✅' : '⚠️'} ${test.name}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      if (!result.success) console.log(`   Error: ${result.error || 'Unknown error'}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
}

testAllEndpoints();