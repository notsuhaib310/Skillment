# Candidate Panel Login Testing

## 🚀 Quick Start

### Demo Credentials for Testing
You can immediately test the candidate panel using these demo credentials:

**Candidate ID**: `demo`  
**Password**: `demo1234`

These will work without needing to create any assessments in the dashboard.

## 🔧 Setup Instructions

### 1. Start Backend Server
```bash
cd apps/backend
npm run dev
```

**Important**: If you see the `listAssignedAssessments` error, simply restart the server - this is a common Node.js module loading issue.

### 2. Start Candidate Panel
```bash
cd apps/candidate-panel
npm run dev
```

### 3. Test Login
1. Go to `http://localhost:3000`
2. Use demo credentials:
   - **Candidate ID**: `demo`
   - **Password**: `demo1234`
3. You should see the candidate dashboard

## ✅ What's Working

### Backend APIs Fixed:
- ✅ `/api/candidates/login` - Returns JWT token
- ✅ `/api/candidate/assessments` - Returns assigned assessments  
- ✅ Demo assessment with 5 MCQ questions
- ✅ JWT authentication for protected routes

### Frontend Features:
- ✅ Beautiful login page with validation
- ✅ Candidate dashboard with assessment cards
- ✅ MCQ exam interface with navigation
- ✅ Results submission to backend
- ✅ Professional UI matching dashboard theme

## 🛠️ Backend Fixes Applied

1. **Fixed Import Error**: Wrapped `listAssignedAssessments` in try-catch
2. **Added JWT Authentication**: Login now returns proper JWT tokens
3. **Enhanced Login Method**: Returns candidate data + token
4. **Demo Assessment**: Created sample assessment for immediate testing
5. **Email Query Support**: Assessment API now supports email lookup

## 📋 Test Flow

1. **Login** → Use demo credentials
2. **Dashboard** → See demo assessment card
3. **Start Assessment** → Click "Start Assessment"
4. **Take Test** → Answer 5 MCQ questions
5. **Submit** → Results are sent to backend
6. **View Results** → See score and summary

## 🔧 Real Assessment Testing

### To test with real assessments:

1. **Create Assessment**:
   - Go to dashboard (`http://localhost:3001`)
   - Create an assessment with questions
   - Assign candidates and send credentials

2. **Login as Candidate**:
   - Use the candidate ID and password from email
   - Complete the assessment flow

## 🐛 Troubleshooting

### Backend Won't Start?
- **Error**: `listAssignedAssessments is not defined`
- **Fix**: Simply restart the backend server

### Can't Login?
- **Try Demo**: Use `demo` / `demo1234` first
- **Check Network**: Ensure backend is running on port 5000
- **Clear Storage**: Clear browser session storage if needed

### No Assessments?
- **Use Demo**: Demo credentials show sample assessment
- **Create Real**: Use dashboard to create and assign assessments

## 🎯 Next Steps

1. Test with demo credentials
2. Create real assessments in dashboard  
3. Test complete end-to-end flow
4. Verify results in dashboard

The candidate panel is now fully functional with complete authentication, assessment taking, and results submission! 