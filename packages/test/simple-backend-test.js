const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing Skillment Backend...\n');

  // Test 1: Check if server is running
  console.log('1. Testing server connection...');
  try {
    await axios.get(`${API_URL}/assessments`, { timeout: 3000 });
    console.log('   ✅ Server is running');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Server is not running');
      console.log('   💡 Start server: cd apps/backend && npm run dev');
      return;
    } else {
      console.log('   ⚠️  Server responding but may need auth');
    }
  }

  // Test 2: Test assessment creation
  console.log('\n2. Testing assessment creation...');
  const testAssessment = {
    title: "Simple Test Assessment",
    description: "Testing backend",
    type: "mcq",
    duration: 30,
    totalMarks: 20,
    passingMarks: 12,
    showResults: true,
    questions: [
      {
        question: "What is 2+2?",
        type: "multiple_choice",
        marks: 10,
        order: 1,
        mcqData: {
          question: "What is 2+2?",
          options: [
            { id: "a", text: "3", isCorrect: false },
            { id: "b", text: "4", isCorrect: true },
            { id: "c", text: "5", isCorrect: false }
          ],
          multipleCorrect: false
        }
      }
    ]
  };

  try {
    const response = await axios.post(`${API_URL}/assessments`, testAssessment);
    console.log('   ✅ Assessment created successfully');
    console.log(`   📝 ID: ${response.data.id}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ⚠️  Need authentication token');
    } else {
      console.log(`   ❌ Failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Test 3: Get assessments
  console.log('\n3. Testing get assessments...');
  try {
    const response = await axios.get(`${API_URL}/assessments`);
    console.log(`   ✅ Found ${response.data.length} assessments`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.data?.error || error.message}`);
  }

  // Test 4: Test stats
  console.log('\n4. Testing stats...');
  try {
    const response = await axios.get(`${API_URL}/assessments/stats`);
    console.log(`   ✅ Stats: ${response.data.totalAssessments} total assessments`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.data?.error || error.message}`);
  }

  console.log('\n✅ Test completed!');
}

testBackend().catch(console.error); 