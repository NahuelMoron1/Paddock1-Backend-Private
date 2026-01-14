// Test script for the cron job functionality
const { updateBest10GameResultsCore } = require('./dist/controllers/Best_tens');

async function testCronJob() {
  console.log('🧪 Testing cron job function...');

  try {
    const result = await updateBest10GameResultsCore();
    console.log('✅ Test result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if called directly
if (require.main === module) {
  testCronJob();
}

module.exports = { testCronJob };