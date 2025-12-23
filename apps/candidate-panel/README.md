# Candidate Panel - Setup and Configuration

This document explains how to set up and run the candidate panel application.

## Prerequisites

- Node.js 18+ installed
- Backend server running (see backend setup)
- pnpm or npm installed

## Environment Configuration

The candidate panel uses environment variables to configure the backend API URL.

### 1. Create Environment File

Copy the example environment file:

```bash
cd apps/candidate-panel
cp .env.example .env.local
```

### 2. Configure API URL

Edit `.env.local` and set the backend API URL:

```env
# For local development (default)
NEXT_PUBLIC_API_URL=http://localhost:5000

# For production
# NEXT_PUBLIC_API_URL=https://api.skillment.in
```

## Running the Application

### Development Mode

```bash
cd apps/candidate-panel
pnpm install  # or npm install
pnpm dev      # or npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
cd apps/candidate-panel
pnpm build
pnpm start
```

## Testing the Application

### Using Demo Credentials

The system includes demo credentials for testing:

- **Candidate ID**: `demo`
- **Password**: `demo1234`

### Using Real Credentials

1. **Create Assessment in Dashboard**:
   - Go to the dashboard at `http://localhost:3001`
   - Create an assessment with questions
   - Allocate candidates and send credentials

2. **Login as Candidate**:
   - Go to `http://localhost:3000`
   - Use the candidate ID and password from the email
   - Complete the assessment

## API Endpoints Used

The candidate panel connects to these backend endpoints:

- `POST /api/candidates/login` - Candidate authentication
- `GET /api/candidates/assessments` - Fetch assigned assessments
- `POST /api/candidates/submit-assessment` - Submit exam answers
- `POST /api/proctoring/event` - Log proctoring events
- `POST /api/proctoring/media` - Upload proctoring media

## Architecture

### Centralized API Configuration

All API calls use the centralized configuration in `lib/api-config.ts`:

```typescript
import { API_ENDPOINTS, getApiHeaders, apiCall } from '@/lib/api-config'

// Example usage
const response = await fetch(API_ENDPOINTS.candidateLogin, {
  method: 'POST',
  headers: getApiHeaders(),
  body: JSON.stringify({ candidateId, password })
})
```

### Component Flow

1. **Login** (`/login`) → Authenticates candidate
2. **Dashboard** (`/dashboard`) → Shows assigned assessments
3. **Guidelines** (`/guidelines`) → Pre-exam instructions (if proctoring enabled)
4. **Exam** (`/exam`) → Assessment taking interface
5. **Summary** (`/summary`) → Results and submission confirmation

## Troubleshooting

### Backend Connection Issues

If you see errors connecting to the backend:

1. Ensure backend is running on the configured port
2. Check `.env.local` has the correct `NEXT_PUBLIC_API_URL`
3. Verify CORS is enabled in backend for `http://localhost:3000`

### No Assessments Found

If candidates see "No assessments found":

1. Verify the candidate has been allocated to an assessment in the dashboard
2. Check the candidate ID matches the one in the database
3. Ensure the assessment status is "invited" or "started"

### Session Storage Issues

The application uses `sessionStorage` to maintain state:

- Clear browser session storage if you encounter login issues
- Do not open multiple tabs for the same exam
- Complete the exam in one session

## Security Features

- JWT-based authentication
- Fullscreen enforcement during exams
- Tab switch detection
- Copy-paste prevention
- Webcam monitoring (if enabled)
- Screen recording (if enabled)

## Support

For issues or questions, contact the development team or refer to the main project documentation.
