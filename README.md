# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/01952010-5841-45ed-804a-ca2d9ee08455

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/01952010-5841-45ed-804a-ca2d9ee08455) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy to Render.com (Recommended)

This project is configured for deployment as a single web service on Render.com:

1. **Push to GitHub:**
   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [Render.com](https://render.com) and sign up/login
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration
   - Set these environment variables in Render dashboard:
     - `DATABASE_URL`: Your PostgreSQL database URL
     - `JWT_SECRET`: A secure random string
     - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (optional)
   - Click "Deploy"

3. **Environment Variables Required:**
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `GOOGLE_CLIENT_ID`: For Google OAuth (optional)
   - `NODE_ENV`: Set to "production" (auto-set by Render)
   - `PORT`: Set to 10000 (auto-set by Render)

### Alternative: Lovable Deployment

Simply open [Lovable](https://lovable.dev/projects/01952010-5841-45ed-804a-ca2d9ee08455) and click on Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
