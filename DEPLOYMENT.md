# Deployment Guide for Single Web Service on Render.com

## Overview
This project is configured to deploy as a **single web service** on Render.com, serving both the React frontend and Express backend from one service.

## Step 1: Push to GitHub
```bash
# Navigate to your project directory
cd shop-project-main

# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for Render deployment"

# Add your GitHub repository as remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. **Render will automatically detect the `render.yaml` configuration**
5. The service will be configured as:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run server`
   - **Plan**: Free

## Step 3: Environment Variables
Add these in Render dashboard (Environment section):

**Required:**
- `DATABASE_URL`: PostgreSQL connection string (create a PostgreSQL database on Render first)
- `JWT_SECRET`: A secure random string (e.g., `openssl rand -base64 32`)

**Optional:**
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID for Google login

**Auto-configured by render.yaml:**
- `NODE_ENV`: production
- `PORT`: 10000
- `ALLOWED_ORIGINS`: Will be set to your Render app URL

## Step 4: Database Setup (MongoDB)
1. Use your existing MongoDB Atlas connection string
2. Set `DATABASE_URL` environment variable in Render dashboard:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/bhagyalaxmi-store
   ```
3. The database will be automatically initialized when the app starts

## Step 5: Deploy
Click "Create Web Service" and wait for deployment. Your app will be available at `https://bhagyalaxmi-store.onrender.com`

## Updating Existing Deployment
Since you already have a deployment at `https://bhagyalaxmi-store.onrender.com`, you can update it by:

1. **Push changes to GitHub** (see commands below)
2. **Render will auto-deploy** from your connected repository
3. **Monitor the deployment** in Render dashboard

## How It Works
- **Build Phase**: Installs dependencies and builds the React frontend to `dist/`
- **Runtime**: Express server serves the built React app and API endpoints
- **Single Service**: Frontend and backend run together, no separate deployments needed
- **File Uploads**: Persistent disk storage for uploaded images

### 4. Deploy
Click "Create Web Service" and wait for deployment.

## Frontend Deployment

### Option A: Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure:
   - **Base directory**: `shop-project-main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Update `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://YOUR_RENDER_BACKEND_URL/api/:splat"
     status = 200
   ```
6. Deploy

### Option B: Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `shop-project-main`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Update `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://YOUR_RENDER_BACKEND_URL/api/$1" }
     ]
   }
   ```
5. Deploy

## Post-Deployment

### 1. Update CORS Origins
In your Render backend environment variables, add your frontend URL:
```
ALLOWED_ORIGINS=https://your-netlify-app.netlify.app,https://your-vercel-app.vercel.app
```

### 2. Test the Application
- Visit your frontend URL
- Try logging in with test credentials:
  - `admin@bhagyalaxmi.com` / `admin123`
  - `user@bhagyalaxmi.com` / `user123`

### 3. Database Setup
The MongoDB Atlas database should already have test data. If not, you can run:
```bash
npm run db:seed
```

## Troubleshooting

### CORS Errors
- Check that your frontend URL is in `ALLOWED_ORIGINS`
- Ensure the backend URL in proxy configs is correct

### API Errors
- Verify the backend is running on Render
- Check environment variables are set correctly
- Review Render logs for errors

### Build Errors
- Ensure all dependencies are in `package.json`
- Check that `npm ci` completes successfully
- Verify Node.js version compatibility

## Security Notes

1. **JWT_SECRET**: Use a strong, random secret in production
2. **DATABASE_URL**: Keep your MongoDB connection string secure
3. **Environment Variables**: Never commit `.env` files to Git
4. **CORS**: Only allow necessary origins in production

## Monitoring

- Set up logging in Render dashboard
- Monitor application performance
- Set up alerts for downtime
- Regular database backups (MongoDB Atlas handles this)
