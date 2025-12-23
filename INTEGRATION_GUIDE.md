# Skillment - Complete Integration Guide

This guide explains how the candidate panel integrates with the main dashboard and backend.

## System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Dashboard     │      │    Backend      │      │ Candidate Panel │
│  (Port 3001)    │◄────►│  (Port 5000)    │◄────►│  (Port 3000)    │
│                 │      │                 │      │                 │
│ - Create Assess │      │ - API Routes    │      │ - Login         │
│ - Allocate      │      │ - Auth & JWT    │      │ - Take Exam     │
│ - View Results  │      │ - Database      │      │ - Submit        │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Complete Setup Flow

### 1. Backend Setup

```bash
cd apps/backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/skillment"
JWT_SECRET="your-secret-key"
PORT=5000
```

Start the backend:
```bash
npm run dev
```

### 2. Dashboard Setup

```bash
cd apps/dashboard
pnpm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the dashboard:
```bash
pnpm dev
```

Dashboard will be available at `http://localhost:3001`

### 3. Candidate Panel Setup

```bash
cd apps/candidate-panel
pnpm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the candidate panel:
```bash
pnpm dev
```

Candidate panel will be available at `http://localhost:3000`

## End-to-End Workflow

### Step 1: Create Assessment (Dashboard)

1. Login to dashboard at `http://localhost:3001`
2. Navigate to "Assessments"
3. Click "Create New Assessment"
4. Fill in assessment details:
   - Title
   - Description
   - Type (MCQ/Coding/Hybrid)
   - Duration
   - Total marks
5. Add questions
6. Configure proctoring settings (optional)
7. Save assessment

### Step 2: Allocate Candidates (Dashboard)

1. Open the assessment you created
2. Click "Allocate Candidates"
3. Add candidates:
   - Name
   - Email
4. System automatically:
   - Generates unique candidate ID (e.g., `CAND123456`)
   - Creates password
   - Sends email with credentials
5. Candidates are now in "invited" status

### Step 3: Candidate Takes Exam (Candidate Panel)

1. Candidate receives email with:
   - Candidate ID
   - Password
   - Link to exam portal
2. Candidate goes to `http://localhost:3000`
3. Logs in with credentials
4. Sees assigned assessment on dashboard
5. Clicks "Start Assessment"
6. If proctoring enabled, goes through system checks
7. Takes the exam
8. Submits answers
9. Sees results summary

### Step 4: View Results (Dashboard)

1. Admin logs into dashboard
2. Opens assessment
3. Views "Results" tab
4. Sees all candidates with:
   - Score
   - Status
   - Time spent
   - Proctoring violations
5. Can view detailed answers
6. Can export results

## API Integration Points

### Authentication Flow

```
Candidate Panel          Backend                 Dashboard
     │                      │                        │
     │  POST /api/candidates/login                  │
     ├─────────────────────►│                        │
     │  { candidateId, pwd }│                        │
     │                      │                        │
     │◄─────────────────────┤                        │
     │  { token, candidate }│                        │
     │                      │                        │
```

### Assessment Fetch Flow

```
Candidate Panel          Backend
     │                      │
     │  GET /api/candidates/assessments?candidateId=...
     ├─────────────────────►│
     │                      │  [Query Database]
     │                      │  - Find credential
     │                      │  - Get candidate
     │                      │  - Include assessment & questions
     │                      │
     │◄─────────────────────┤
     │  { candidate, assessment }
     │                      │
```

### Submission Flow

```
Candidate Panel          Backend                 Dashboard
     │                      │                        │
     │  POST /api/candidates/submit-assessment      │
     ├─────────────────────►│                        │
     │  { candidateId,      │                        │
     │    answers,          │                        │
     │    timeSpent }       │                        │
     │                      │                        │
     │                      │  [Calculate Score]     │
     │                      │  [Update Database]     │
     │                      │                        │
     │◄─────────────────────┤                        │
     │  { score, total }    │                        │
     │                      │                        │
     │                      │  [Analytics Updated]   │
     │                      │                        │
     │                      │  Results now visible ──►│
```

## Database Schema Integration

### Key Tables

1. **Credential** - Stores login credentials
   - `candidateId` (unique, e.g., CAND123456)
   - `email`
   - `passwordHash`

2. **Candidate** - Stores assessment assignments
   - `id` (internal DB ID)
   - `name`
   - `email` (links to Credential)
   - `assessmentId` (links to Assessment)
   - `status` (invited/started/submitted)
   - `score`
   - `answers` (JSON)
   - `timeSpent`

3. **Assessment** - Assessment definition
   - `id`
   - `title`
   - `type`
   - `duration`
   - `questions` (relation)

4. **Question** - Question data
   - `id`
   - `question`
   - `type`
   - `mcqData` (for MCQ questions)
   - `codingData` (for coding questions)
   - `correctAnswer`
   - `marks`

## Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000
EMAIL_SERVICE_API_KEY="..." # For sending emails
```

### Dashboard (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Candidate Panel (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Common Issues and Solutions

### Issue: "No assessments found"

**Cause**: Candidate not properly allocated
**Solution**: 
1. Check candidate exists in dashboard
2. Verify email matches in both Credential and Candidate tables
3. Ensure assessment is not expired

### Issue: "Invalid credentials"

**Cause**: Candidate ID or password incorrect
**Solution**:
1. Verify candidate ID format (CANDxxxxxxxxx)
2. Check password hasn't expired
3. Resend credentials from dashboard

### Issue: Backend connection failed

**Cause**: CORS or network issues
**Solution**:
1. Verify backend is running on port 5000
2. Check CORS configuration includes localhost:3000 and localhost:3001
3. Verify NEXT_PUBLIC_API_URL in .env.local files

### Issue: Results not appearing in dashboard

**Cause**: Submission didn't save properly
**Solution**:
1. Check backend logs for submission errors
2. Verify candidate status is "submitted"
3. Check answers are saved in database

## Testing Checklist

- [ ] Backend starts successfully
- [ ] Dashboard loads and connects to backend
- [ ] Candidate panel loads and connects to backend
- [ ] Can create assessment in dashboard
- [ ] Can allocate candidates
- [ ] Email credentials are generated
- [ ] Candidate can login
- [ ] Assessment appears in candidate dashboard
- [ ] Candidate can start exam
- [ ] Questions load correctly
- [ ] Can submit answers
- [ ] Results appear in candidate summary
- [ ] Results appear in dashboard
- [ ] Score is calculated correctly

## Production Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Ensure CORS allows production frontend domains
3. Use secure JWT_SECRET
4. Enable HTTPS for all connections
5. Configure email service for credential delivery
6. Set up proper database backups
7. Monitor proctoring data storage

## Support

For additional help:
- Check backend logs: `apps/backend/logs`
- Review API documentation
- Contact development team
