# Vercel Deployment Guide

This guide walks you through deploying the ChatterBox application to Vercel as a monorepo.

## Prerequisites

- GitHub account (for connecting repository)
- Vercel account (free at [vercel.com](https://vercel.com))
- MongoDB Atlas connection string
- Cloudinary API credentials
- All other environment variables configured

## Step-by-Step Deployment

### 1. Push to GitHub

Ensure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Setup Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select your repository
4. Vercel should auto-detect the monorepo structure

### 3. Configure Build Settings

- **Root Directory**: Leave blank (monorepo root)
- **Framework Preset**: Other (since we're using custom vercel.json)
- **Build Command**: `npm run build --prefix client`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install && npm install --prefix server && npm install --prefix client`

### 4. Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

#### Backend Variables (All Environments)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
```

#### Frontend Variables (All Environments)
```
VITE_API_URL=https://<your-vercel-domain>.vercel.app
```

**Replace `<your-vercel-domain>` with the domain Vercel assigns to your project**

### 5. Deploy

Click **Deploy** and wait for the build to complete. Vercel will provide a live URL.

### 6. Verify Deployment

1. Visit your Vercel URL
2. Test login/authentication
3. Check Socket.io connection (real-time chat)
4. Verify file uploads and media features

## URLs After Deployment

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-project.vercel.app/api/*`
- **Socket.io**: Same domain (automatic upgrade to WSS)

## Troubleshooting

### CORS Errors

If you see CORS errors in browser console:
- Verify `VITE_API_URL` is set correctly in Vercel environment variables
- Ensure Vercel domain is added to `allowedOrigins` in `server/server.js`
- Clear browser cache and hard refresh

### Socket.io Connection Issues

- Check that Socket.io origins in `server/config/socket.js` include your Vercel domain
- Verify `VERCEL_URL` is automatically set (check Vercel function logs)

### Build Failures

Check the **Deployment Logs** in Vercel dashboard:
- Missing dependencies? Run `npm install` locally and commit `package-lock.json`
- Env variable missing? Add it in Environment Variables section
- Syntax errors? Fix locally and push again

### MongoDB Connection Issues

- Whitelist Vercel's IP ranges in MongoDB Atlas (or allow all IPs: `0.0.0.0/0` for testing)
- Verify `MONGODB_URI` is correct and includes database name
- Check connection string format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

## Redeploying

After making changes:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically redeploy on push.

## Development Locally

To test locally before pushing to Vercel:

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

Then visit `http://localhost:5173` and ensure `VITE_API_URL=http://localhost:5000` or use the value from `.env.local`

## Next Steps

- Monitor Vercel Analytics dashboard for performance
- Set up GitHub branch protection rules for production deployments
- Consider adding staging deployment for preview URLs
- Enable Vercel's security headers and automatic HTTPS
