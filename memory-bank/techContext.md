# Technical Context

## Development Environment

### Frontend Applications
1. **Dashboard & Landing Page**
   - Next.js 14
   - TypeScript
   - Tailwind CSS
   - pnpm package manager
   - Environment variables in `.env`

2. **UI Components**
   - Custom component library
   - Shadcn UI components
   - Lucide icons
   - Custom animations

### Backend Service
1. **Core Technologies**
   - Node.js
   - TypeScript
   - Express.js
   - Prisma ORM
   - PostgreSQL database

2. **Development Tools**
   - npm package manager
   - TypeScript configuration
   - Environment variables in `.env`
   - PM2 for process management

## Dependencies

### Frontend Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "lucide-react": "latest",
  "@radix-ui/react-dialog": "latest"
}
```

### Backend Dependencies
```json
{
  "express": "^4.0.0",
  "typescript": "^5.0.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "latest"
}
```

## Technical Constraints

1. **Browser Support**
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - No IE11 support required

2. **Performance Requirements**
   - First contentful paint < 1.5s
   - Time to interactive < 3s
   - Lighthouse score > 90

3. **Security Requirements**
   - HTTPS only
   - JWT authentication
   - CORS configuration
   - Rate limiting
   - Input validation

4. **Deployment Requirements**
   - Vercel for frontend applications
   - Node.js environment for backend
   - Database hosting
   - Environment variable management

## Development Setup

1. **Frontend Setup**
   ```bash
   cd apps/dashboard # or apps/landing
   pnpm install
   pnpm dev
   ```

2. **Backend Setup**
   ```bash
   cd apps/backend
   npm install
   npm run dev
   ```

3. **Database Setup**
   ```bash
   cd apps/backend
   npx prisma migrate dev
   ```

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/skillment
JWT_SECRET=your-secret-key
PORT=3000
```

## Build and Deployment

1. **Frontend Build**
   - Next.js build process
   - Static file optimization
   - Environment variable injection

2. **Backend Build**
   - TypeScript compilation
   - Prisma client generation
   - Environment variable validation

3. **Deployment Process**
   - Vercel deployment for frontend
   - Node.js deployment for backend
   - Database migrations
   - Environment configuration 