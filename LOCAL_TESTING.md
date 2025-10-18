# Local Testing Guide

## Prerequisites
- Node.js (v16 or higher)
- npm
- MongoDB connection string

## Environment Setup

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your values**:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/bhagyalaxmi-store
   JWT_SECRET=your-local-jwt-secret-here
   GOOGLE_CLIENT_ID=your-google-client-id
   NODE_ENV=development
   PORT=3001
   ```

## Local Development Commands

### Option 1: Full Stack (Recommended for testing deployment)
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start server (serves both frontend and API)
npm run server
```
**Access:** http://localhost:3001

### Option 2: Development Mode (for development)
```bash
# Install dependencies
npm install

# Run both frontend and backend in development
npm run dev:full
```
**Frontend:** http://localhost:5173
**Backend:** http://localhost:3001

## Testing the Build

1. **Check if build works:**
   ```bash
   npm run build
   ls -la dist/
   ```

2. **Test server startup:**
   ```bash
   npm run server
   ```

3. **Verify endpoints:**
   - Frontend: http://localhost:3001
   - API Info: http://localhost:3001/api/info
   - Health: http://localhost:3001/api/health

## Common Issues

- **Build fails:** Check for TypeScript errors or missing dependencies
- **Server won't start:** Verify MongoDB connection string
- **Frontend not loading:** Ensure `dist/` folder exists after build
- **API errors:** Check environment variables are set

## Success Indicators

✅ `npm run build` completes without errors
✅ `dist/` folder contains built files
✅ Server starts without errors
✅ Frontend loads at http://localhost:3001
✅ API responds at http://localhost:3001/api/health
