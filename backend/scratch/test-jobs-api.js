async function test() {
  console.log('Verifying new Job Search and AI Recommendation endpoints...');
  
  // Note: These endpoints require authorization, but we can verify JSearch and local functions directly 
  // by calling them through our job service!
  const jobService = require('../src/modules/job/job.service');
  
  try {
    console.log('Testing searchOnlineJobs JSearch integration...');
    const searchRes = await jobService.searchOnlineJobs('React Developer', 'Bangalore', 'full-time', 1);
    console.log('Online Search Results count:', searchRes.length);
    console.log('First search result sample:', {
      title: searchRes[0]?.title,
      company: searchRes[0]?.company,
      location: searchRes[0]?.location,
      salary: searchRes[0]?.salary
    });

    console.log('\nTesting AI Job Recommendations function...');
    // Testing with a dummy user ID 1
    const recs = await jobService.getAiRecommendations(1);
    console.log('AI Recommendations Result:', recs);

    console.log('\nAll direct API integration calls verified successfully!');
  } catch (error) {
    console.error('Job API Verification failed:', error);
  }
}

test();
