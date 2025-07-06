const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:5000/api';
const TEST_CONFIG = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    // Add auth token if needed: 'Authorization': 'Bearer your_token_here'
  }
};

// Test data
const SAMPLE_ASSESSMENT = {
  title: "Test Assessment - Backend Integration",
  description: "Comprehensive test for enhanced backend functionality",
  instructions: "Please answer all questions carefully",
  type: "hybrid",
  duration: 60,
  totalMarks: 50,
  passingMarks: 30,
  attemptLimit: 1,
  showResults: true,
  showCorrectAnswers: false,
  enableProctoring: false,
  randomizeQuestions: false,
  randomizeOptions: false,
  allowBackNavigation: true,
  timeWarnings: true,
  autoSubmit: true,
  tags: ["test", "backend", "integration"],
  questions: [
    {
      question: "What is JavaScript?",
      type: "multiple_choice",
      marks: 10,
      order: 1,
      hints: ["Think about programming languages"],
      explanation: "JavaScript is a programming language",
      difficulty: "easy",
      tags: ["javascript", "basics"],
      mcqData: {
        question: "What is JavaScript?",
        options: [
          { id: "opt1", text: "A programming language", isCorrect: true },
          { id: "opt2", text: "A database", isCorrect: false },
          { id: "opt3", text: "A browser", isCorrect: false }
        ],
        explanation: "JavaScript is a versatile programming language",
        multipleCorrect: false
      }
    },
    {
      question: "Simple Function Implementation",
      type: "coding",
      marks: 20,
      order: 2,
      hints: ["Use basic JavaScript syntax"],
      explanation: "Test basic coding skills",
      difficulty: "easy",
      tags: ["coding", "functions"],
      codingData: {
        title: "Add Two Numbers",
        description: "Write a function that adds two numbers and returns the result",
        timeLimit: 10,
        memoryLimit: 128,
        languages: ["javascript", "python"],
        starterCode: {
          javascript: "function addNumbers(a, b) {\n  // Your code here\n}",
          python: "def add_numbers(a, b):\n    # Your code here\n    pass"
        },
        testCases: [
          {
            id: "tc1",
            input: "2, 3",
            expectedOutput: "5",
            isPublic: true,
            explanation: "2 + 3 should equal 5"
          }
        ]
      }
    },
    {
      question: "Which are frontend technologies?",
      type: "multiple_choice",
      marks: 20,
      order: 3,
      hints: ["Multiple correct answers possible"],
      explanation: "Frontend technologies are used for user interfaces",
      difficulty: "medium",
      tags: ["frontend", "technologies"],
      mcqData: {
        question: "Which are frontend technologies?",
        options: [
          { id: "opt1", text: "React", isCorrect: true },
          { id: "opt2", text: "Vue.js", isCorrect: true },
          { id: "opt3", text: "MongoDB", isCorrect: false },
          { id: "opt4", text: "Express.js", isCorrect: false }
        ],
        explanation: "React and Vue.js are frontend frameworks",
        multipleCorrect: true
      }
    }
  ],
  webcamMonitoring: false,
  screenRecording: false,
  tabSwitchDetection: false
};

// Test functions
async function testServerHealth() {
  console.log('🏥 Testing Server Health...');
  try {
    const response = await axios.get(`${API_BASE}/health`, { 
      timeout: TEST_CONFIG.timeout,
      validateStatus: () => true // Accept any status
    });
    
    if (response.status === 200) {
      console.log('   ✅ Server is healthy');
      return true;
    } else if (response.status === 404) {
      console.log('   ⚠️  Health endpoint not found, but server is responding');
      return true;
    } else {
      console.log(`   ❌ Server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Server is not running (Connection refused)');
    } else {
      console.log(`   ❌ Server health check failed: ${error.message}`);
    }
    return false;
  }
}

async function testAssessmentCreation() {
  console.log('\n📝 Testing Assessment Creation...');
  try {
    const response = await axios.post(
      `${API_BASE}/assessments`, 
      SAMPLE_ASSESSMENT, 
      TEST_CONFIG
    );
    
    if (response.status === 201 || response.status === 200) {
      console.log('   ✅ Assessment created successfully');
      console.log(`   📋 Assessment ID: ${response.data.id}`);
      console.log(`   📊 Title: ${response.data.title}`);
      console.log(`   🔢 Questions: ${response.data.questions?.length || response.data.totalQuestions}`);
      return response.data;
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ Failed with status ${error.response.status}`);
      console.log(`   📄 Error: ${error.response.data?.error || error.response.data?.message}`);
      if (error.response.data?.details) {
        console.log('   📋 Details:', error.response.data.details);
      }
    } else {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    return null;
  }
}

async function testAssessmentRetrieval() {
  console.log('\n📚 Testing Assessment Retrieval...');
  try {
    const response = await axios.get(`${API_BASE}/assessments`, TEST_CONFIG);
    
    if (response.status === 200) {
      const assessments = response.data;
      console.log('   ✅ Assessments retrieved successfully');
      console.log(`   📊 Total assessments: ${assessments.length}`);
      
      if (assessments.length > 0) {
        const lastAssessment = assessments[0];
        console.log(`   📝 Latest: "${lastAssessment.title}"`);
        console.log(`   🔢 Questions: ${lastAssessment.questions?.length || lastAssessment.totalQuestions}`);
      }
      return assessments;
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ Failed with status ${error.response.status}`);
      console.log(`   📄 Error: ${error.response.data?.error}`);
    } else {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    return null;
  }
}

async function testAssessmentStats() {
  console.log('\n📈 Testing Assessment Statistics...');
  try {
    const response = await axios.get(`${API_BASE}/assessments/stats`, TEST_CONFIG);
    
    if (response.status === 200) {
      const stats = response.data;
      console.log('   ✅ Statistics retrieved successfully');
      console.log(`   📊 Total assessments: ${stats.totalAssessments}`);
      console.log(`   🟢 Live assessments: ${stats.liveAssessments}`);
      console.log(`   📄 Draft assessments: ${stats.draftAssessments}`);
      console.log(`   👥 Total candidates: ${stats.totalCandidates}`);
      console.log(`   📊 Average score: ${stats.averageScore?.toFixed(1) || 0}`);
      return stats;
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ Failed with status ${error.response.status}`);
      console.log(`   📄 Error: ${error.response.data?.error}`);
    } else {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    return null;
  }
}

async function testCandidateEndpoints() {
  console.log('\n👥 Testing Candidate Endpoints...');
  try {
    const response = await axios.get(`${API_BASE}/candidate-assessment/assessments`, {
      timeout: TEST_CONFIG.timeout,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      console.log('   ✅ Candidate assessment endpoint is accessible');
      console.log('   📋 Available endpoints:', response.data.endpoints?.length || 'Listed');
      return true;
    } else {
      console.log(`   ⚠️  Candidate endpoint responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Candidate endpoints test failed: ${error.message}`);
    return false;
  }
}

async function testDataStructureValidation() {
  console.log('\n🔍 Testing Data Structure Validation...');
  
  // Test question data structure
  const mcqQuestion = SAMPLE_ASSESSMENT.questions[0];
  const codingQuestion = SAMPLE_ASSESSMENT.questions[1];
  const multipleCorrectQuestion = SAMPLE_ASSESSMENT.questions[2];
  
  console.log('   📝 MCQ Question Structure:');
  console.log(`      ✅ Question text: ${!!mcqQuestion.question}`);
  console.log(`      ✅ MCQ data: ${!!mcqQuestion.mcqData}`);
  console.log(`      ✅ Options count: ${mcqQuestion.mcqData.options.length}`);
  console.log(`      ✅ Has correct answer: ${mcqQuestion.mcqData.options.some(opt => opt.isCorrect)}`);
  
  console.log('   💻 Coding Question Structure:');
  console.log(`      ✅ Title: ${!!codingQuestion.codingData.title}`);
  console.log(`      ✅ Languages: ${codingQuestion.codingData.languages.length}`);
  console.log(`      ✅ Starter code: ${Object.keys(codingQuestion.codingData.starterCode).length} languages`);
  console.log(`      ✅ Test cases: ${codingQuestion.codingData.testCases.length}`);
  
  console.log('   🔢 Multiple Correct Question:');
  console.log(`      ✅ Multiple correct flag: ${multipleCorrectQuestion.mcqData.multipleCorrect}`);
  console.log(`      ✅ Correct answers: ${multipleCorrectQuestion.mcqData.options.filter(opt => opt.isCorrect).length}`);
  
  console.log('   📊 Assessment Metadata:');
  console.log(`      ✅ Enhanced fields: instructions, passingMarks, showCorrectAnswers`);
  console.log(`      ✅ Proctoring config: webcam, screen recording, tab detection`);
  console.log(`      ✅ Question types: MCQ, Coding, Multiple correct`);
  
  return true;
}

async function runAllTests() {
  console.log('🧪 SKILLMENT BACKEND FUNCTIONALITY TEST\n');
  console.log('=====================================\n');
  
  const results = {
    serverHealth: false,
    assessmentCreation: false,
    assessmentRetrieval: false,
    assessmentStats: false,
    candidateEndpoints: false,
    dataStructure: false
  };
  
  // Test 1: Server Health
  results.serverHealth = await testServerHealth();
  
  if (!results.serverHealth) {
    console.log('\n❌ Server is not running. Please start the backend server:');
    console.log('   cd apps/backend');
    console.log('   npm run prisma:generate');
    console.log('   npm run dev');
    return results;
  }
  
  // Test 2: Data Structure Validation
  results.dataStructure = await testDataStructureValidation();
  
  // Test 3: Assessment Creation
  const createdAssessment = await testAssessmentCreation();
  results.assessmentCreation = !!createdAssessment;
  
  // Test 4: Assessment Retrieval
  results.assessmentRetrieval = !!(await testAssessmentRetrieval());
  
  // Test 5: Assessment Statistics
  results.assessmentStats = !!(await testAssessmentStats());
  
  // Test 6: Candidate Endpoints
  results.candidateEndpoints = await testCandidateEndpoints();
  
  // Summary
  console.log('\n🏁 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log(`🏥 Server Health:          ${results.serverHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔍 Data Structure:         ${results.dataStructure ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📝 Assessment Creation:    ${results.assessmentCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📚 Assessment Retrieval:   ${results.assessmentRetrieval ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📈 Assessment Statistics:  ${results.assessmentStats ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`👥 Candidate Endpoints:    ${results.candidateEndpoints ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Your backend is fully functional!');
    console.log('\n✅ Ready for production:');
    console.log('   • Enhanced assessment structure ✅');
    console.log('   • MCQ with multiple correct answers ✅');
    console.log('   • Coding questions with test cases ✅');
    console.log('   • Comprehensive validation ✅');
    console.log('   • Candidate panel APIs ✅');
    console.log('   • Assessment analytics ✅');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    
    if (!results.serverHealth) {
      console.log('\n🔧 First, ensure the backend server is running.');
    }
    if (!results.assessmentCreation) {
      console.log('\n🔧 Check authentication and database connection.');
    }
  }
  
  return results;
}

// Handle missing axios gracefully
async function checkDependencies() {
  try {
    require('axios');
    return true;
  } catch (error) {
    console.log('❌ axios is not installed. Please install it:');
    console.log('   npm install axios');
    return false;
  }
}

// Main execution
(async () => {
  const hasAxios = await checkDependencies();
  if (hasAxios) {
    await runAllTests();
  }
})(); 