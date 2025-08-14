# Vercel Deployment Guide

## Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Have a Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Build and Test Locally
```bash
cd frontend
npm run build
npm start
```

## Step 2: Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy (run from frontend directory)
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: udyam-frontend (or your preferred name)
# - Directory: ./ (current directory)
# - Override settings: No
```

## Step 3: Configure Environment Variables
In Vercel dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com/api`

## Step 4: Update Backend CORS
Update your backend CORS settings to allow your Vercel domain:
```typescript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

## Step 5: Redeploy (if needed)
```bash
vercel --prod
```

## Troubleshooting
- If build fails, check console for errors
- Ensure all dependencies are in package.json
- Check environment variables are set correctly
- Verify backend CORS allows Vercel domain
