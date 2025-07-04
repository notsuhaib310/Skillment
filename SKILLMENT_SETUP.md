# Skillment Assessment Platform - Complete Setup Guide

## Overview

This is a fully functional assessment platform with the following components:
- **Backend API** (Node.js + Express + Prisma + PostgreSQL)
- **Dashboard** (Next.js - Admin panel for creating assessments and managing candidates)
- **Candidate Panel** (Next.js - For candidates to take assessments)

## Features Implemented

### ✅ Backend Features
- Complete authentication system
- Assessment creation and management
- Candidate allocation with auto-generated credentials
- Email service for sending credentials
- Assessment submission and scoring
- Proctoring support
- Real-time monitoring

### ✅ Dashboard Features
- Assessment creation with questions
- Candidate allocation (individual/bulk CSV import)
- Email credential sending
- Assessment management and monitoring
- Results export
- Real-time candidate tracking

### ✅ Candidate Panel Features
- Secure login with candidate ID/password
- Assessment guidelines and system checks
- MCQ exam interface with timer and proctoring
- Coding exam interface (integrated)
- Assessment summary before submission
- Fullscreen mode and security features
- Automatic submission on time completion

### ✅ Proctoring Features
- Fullscreen enforcement
- Tab switch detection
- Copy/paste prevention
- Right-click disable
- Webcam monitoring ready
- Screen recording ready

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **pnpm** package manager
4. **Email service** (SMTP credentials)

## Setup Instructions

### 1. Environment Setup

Create `.env` files for each application:

#### Backend `.env` (apps/backend/.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/skillment"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
BCRYPT_ROUNDS=10
PORT=5000

# Email Service (Resend/SMTP)
RESEND_SMTP_HOST="smtp.resend.com"
RESEND_SMTP_PORT="587"
RESEND_SMTP_USER="resend"
RESEND_SMTP_PASS="your-resend-api-key"
FROM_EMAIL="no-reply@yourdomain.com"

# Candidate Panel URL
CANDIDATE_LOGIN_LINK="http://localhost:3002/login"
```

#### Dashboard `.env` (apps/dashboard/.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3001"
```

#### Candidate Panel `.env` (apps/candidate-panel/.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### 2. Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE skillment;
```

2. Run database migrations:
```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
```

### 3. Install Dependencies

From the root directory:
```bash
pnpm install
```

### 4. Start Development Servers

#### Terminal 1 - Backend API
```bash
cd apps/backend
pnpm dev
# Backend runs on http://localhost:5000
```

#### Terminal 2 - Dashboard
```bash
cd apps/dashboard
pnpm dev
# Dashboard runs on http://localhost:3001
```

#### Terminal 3 - Candidate Panel
```bash
cd apps/candidate-panel
pnpm dev
# Candidate panel runs on http://localhost:3002
```

## Usage Workflow

### 1. Admin Dashboard (http://localhost:3001)

1. **Create Assessment**
   - Go to Assessments → Create Assessment
   - Add questions (MCQ or Coding)
   - Configure proctoring settings
   - Set duration and marks

2. **Allocate Candidates**
   - Open assessment → Manage → Candidates tab
   - Click "Allocate Candidates"
   - Add candidates individually or import CSV
   - System auto-generates credentials and sends emails

3. **Monitor Assessment**
   - View real-time candidate progress
   - Export results
   - Track completion status

### 2. Candidate Experience (http://localhost:3002)

1. **Login**
   - Enter Candidate ID and Password (received via email)
   
2. **Assessment Flow**
   - Read guidelines and accept terms
   - Complete system checks (if proctoring enabled)
   - Take assessment (MCQ or Coding)
   - Review answers in summary
   - Submit assessment

3. **Security Features**
   - Fullscreen enforcement
   - Tab switch detection
   - Copy/paste prevention
   - Timer with auto-submission

## API Endpoints

### Public Endpoints
- `POST /api/candidates/login` - Candidate login
- `GET /api/candidates/assessments` - Get candidate assessment
- `POST /api/candidates/submit-assessment` - Submit assessment

### Protected Endpoints (Admin)
- `GET /api/assessments` - List assessments
- `POST /api/assessments` - Create assessment
- `POST /api/admin/candidates/allocate` - Allocate candidates
- `GET /api/admin/candidates` - List candidates for assessment

## Email Templates

The system includes professional email templates for:
- Assessment invitations with credentials
- Welcome emails
- Team invitations
- Admin notifications

## Proctoring Configuration

Enable proctoring features in assessment settings:
- `enableProctoring`: Master proctoring toggle
- `webcamMonitoring`: Require camera access
- `screenRecording`: Record screen activity
- `tabSwitchDetection`: Detect tab switches
- `copyPasteDetection`: Prevent copy/paste
- `rightClickDisable`: Disable right-click
- `fullscreenMode`: Force fullscreen mode

## Database Schema

The system uses the following main models:
- `User` - Admin users
- `Organization` - Multi-tenant support
- `Assessment` - Assessment definitions
- `Question` - Assessment questions
- `Candidate` - Candidate records
- `Credential` - Login credentials
- `EmailLog` - Email tracking

## File Structure

```
skillment/
├── apps/
│   ├── backend/          # Express API server
│   ├── dashboard/        # Admin dashboard (Next.js)
│   └── candidate-panel/  # Candidate interface (Next.js)
├── packages/
│   └── code-runner/      # Code execution service
└── README.md
```

## Demo Credentials

For testing, use these demo credentials:
- **Candidate ID**: `demo`
- **Password**: `demo1234`

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Run `npx prisma migrate dev`

2. **Email Sending Failed**
   - Check SMTP credentials
   - Verify FROM_EMAIL domain

3. **CORS Errors**
   - Backend includes candidate panel URL in CORS config
   - Check port numbers match

4. **Assessment Not Loading**
   - Verify candidate has been allocated to assessment
   - Check API endpoint URLs

### Performance Tips

1. Use connection pooling for database
2. Implement Redis for session storage
3. Use CDN for static assets
4. Enable gzip compression

## Production Deployment

### Environment Variables
Update all localhost URLs to production domains:
- `CANDIDATE_LOGIN_LINK`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_API_URL`

### Database
- Use managed PostgreSQL service
- Enable SSL connections
- Set up backups

### Security
- Use HTTPS everywhere
- Implement rate limiting
- Add request logging
- Use environment-specific secrets

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API logs in backend console
3. Check browser console for frontend errors
4. Verify database connections

---

**Note**: This is a complete, production-ready assessment platform with enterprise-grade features including proctoring, email automation, and real-time monitoring.