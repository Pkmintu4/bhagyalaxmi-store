# Deployment Guide

## Backend Deployment (Render)

### 1. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin deploy
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `shop-api` (or your preferred name)
   - **Root Directory**: `shop-project-main` (if repo is at root, leave blank)
   - **Runtime**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or paid if needed)

### 3. Environment Variables
Add these in Render dashboard:
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/shop-project
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
GOOGLE_CLIENT_ID=your-google-client-id (optional)
```

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
