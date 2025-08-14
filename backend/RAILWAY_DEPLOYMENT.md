# Railway Deployment Guide

## Prerequisites
1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be on GitHub
3. **PostgreSQL Database**: We'll set this up on Railway

## Step 1: Deploy Backend to Railway

### 1.1 Create New Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `openbiz-udyam` repository

### 1.2 Configure Backend Service
1. **Service Name**: `udyam-backend`
2. **Root Directory**: `backend`
3. **Build Command**: `npm run build`
4. **Start Command**: `node dist/index.js`
5. **Health Check Path**: `/health`

### 1.3 Set Environment Variables
Add these environment variables in Railway dashboard:

```
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Step 2: Set Up PostgreSQL Database

### 2.1 Add PostgreSQL Service
1. In your Railway project, click "New Service"
2. Choose "Database" → "PostgreSQL"
3. **Service Name**: `udyam-postgres`

### 2.2 Configure Database
1. **Database Name**: `udyam_db`
2. **Username**: `udyam_user`
3. **Password**: Auto-generated (save this!)

### 2.3 Get Connection Details
1. Click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy the connection string

### 2.4 Set Database Environment Variables
Add to your backend service:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

## Step 3: Deploy and Test

### 3.1 Deploy Backend
1. Railway will automatically build and deploy
2. Wait for build to complete
3. Note your Railway URL (e.g., `https://udyam-backend-production.up.railway.app`)

### 3.2 Run Database Migrations
1. Go to your backend service
2. Click "Deployments" tab
3. Click "Deploy" to trigger a new deployment
4. Check logs for migration success

### 3.3 Test Your API
Test these endpoints:
- `GET /health` - Should return status OK
- `POST /api/step1/initiate` - Should create registration
- `POST /api/step1/verify-otp` - Should verify OTP
- `POST /api/step2/submit` - Should complete registration

## Step 4: Update Frontend

### 4.1 Update Environment Variable
In your Vercel dashboard, update:
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app/api
```

### 4.2 Redeploy Frontend
1. Go to Vercel dashboard
2. Click "Redeploy" on your project
3. Wait for deployment to complete

## Step 5: Test Complete Flow

1. **Frontend**: Visit your Vercel URL
2. **Step 1**: Test Aadhaar + OTP flow
3. **Step 2**: Test PAN validation
4. **Database**: Check Railway dashboard for data

## Troubleshooting

### Build Failures
- Check Railway build logs
- Ensure all dependencies are in package.json
- Verify Dockerfile is correct

### Database Connection Issues
- Check DATABASE_URL format
- Ensure PostgreSQL service is running
- Verify network access

### CORS Issues
- Check CORS configuration in backend
- Verify frontend URL is correct
- Check browser console for errors

## Cost Estimation

**Free Tier**: $5 credit/month
- **Backend**: ~$2-3/month (small API)
- **PostgreSQL**: ~$1-2/month (small database)
- **Total**: Should fit within free tier

## Next Steps

After successful deployment:
1. **Monitor**: Check Railway dashboard for usage
2. **Scale**: Upgrade if you exceed free tier
3. **Custom Domain**: Add custom domain if needed
4. **SSL**: Railway provides automatic HTTPS

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Discord**: [railway.app/discord](https://railway.app/discord)
- **GitHub**: [github.com/railwayapp](https://github.com/railwayapp)
