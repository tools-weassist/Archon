# Archon Cloud Deployment Guide

This guide will help you deploy Archon to the cloud so you can access it from anywhere.

## Architecture Overview

- **Frontend**: Deployed to Netlify (free tier)
- **Backend Services**: Deployed to Railway (multiple services)
- **Database**: Supabase (already cloud-based)

## Prerequisites

1. **Supabase Account** (free tier available)
   - Already set up if you're running locally
   - Your existing database will work for cloud deployment

2. **Railway Account** (free trial with $5 credit)
   - Sign up at https://railway.app
   - Connect your GitHub account

3. **Netlify Account** (free tier)
   - Sign up at https://netlify.com
   - Connect your GitHub account

## Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare for cloud deployment"
git push origin main
```

## Step 2: Deploy Backend to Railway

### Option A: Deploy via Railway Dashboard (Recommended)

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose your Archon repository
4. Railway will detect the Python app automatically

### Configure Environment Variables in Railway:

Click on your service and go to "Variables" tab, then add:

```env
# Required - copy from your local .env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Optional but recommended
OPENAI_API_KEY=your-openai-key
LOG_LEVEL=INFO

# Service discovery
SERVICE_DISCOVERY_MODE=railway
RAILWAY_ENVIRONMENT=production

# Port configuration (Railway provides PORT automatically)
# Railway will inject PORT env variable
```

### Deploy Multiple Services:

Since Archon has 3 backend services, you'll need to create 3 services in Railway:

1. **Main Server (archon-server)**:
   - Start command: `python -m uvicorn src.server.main:socket_app --host 0.0.0.0 --port $PORT`
   - Exposes WebSocket and REST API

2. **MCP Server (archon-mcp)**:
   - Start command: `python -m uvicorn src.mcp.server:app --host 0.0.0.0 --port $PORT`
   - Handles MCP protocol

3. **Agents Service (archon-agents)**:
   - Start command: `python -m uvicorn src.agents.server:app --host 0.0.0.0 --port $PORT`
   - Handles AI operations

For each service:
1. Click "New" → "GitHub Repo" in Railway
2. Select the same repository
3. Update the start command in Settings
4. Add the same environment variables
5. Note the public URL for each service

### Option B: Deploy via Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
cd python
railway init
```

4. Link to your project:
```bash
railway link
```

5. Deploy:
```bash
railway up
```

## Step 3: Deploy Frontend to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com/start
2. Connect to GitHub and select your repository
3. Configure build settings:
   - **Base directory**: `archon-ui-main`
   - **Build command**: `npm run build`
   - **Publish directory**: `archon-ui-main/dist`

4. Add environment variables:
   - Click "Show advanced" before deploying
   - Add: `VITE_API_URL` = `https://your-archon-server.up.railway.app`
   - (Replace with your actual Railway URL from Step 2)

5. Click "Deploy site"

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Build the frontend:
```bash
cd archon-ui-main
npm install
npm run build
```

4. Deploy:
```bash
netlify deploy --prod --dir=dist
```

5. Configure environment in Netlify dashboard

## Step 4: Update Configuration

### Update Frontend API URL

1. In Netlify dashboard, go to Site settings → Environment variables
2. Update `VITE_API_URL` to your Railway backend URL
3. Trigger a redeploy

### Update the netlify.toml redirects

Edit `archon-ui-main/netlify.toml` and update the proxy URLs:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://YOUR-RAILWAY-APP.up.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/socket.io/*"
  to = "https://YOUR-RAILWAY-APP.up.railway.app/socket.io/:splat"
  status = 200
  force = true
```

## Step 5: Configure Inter-Service Communication

In Railway, services can communicate internally. Update each service's environment variables:

```env
# For archon-server
ARCHON_MCP_URL=https://archon-mcp.up.railway.app
ARCHON_AGENTS_URL=https://archon-agents.up.railway.app

# For archon-mcp
API_SERVICE_URL=https://archon-server.up.railway.app
AGENTS_SERVICE_URL=https://archon-agents.up.railway.app

# For archon-agents
API_SERVICE_URL=https://archon-server.up.railway.app
MCP_SERVICE_URL=https://archon-mcp.up.railway.app
```

## Step 6: Verify Deployment

1. **Check Backend Health**:
   - Visit: `https://your-archon-server.up.railway.app/health`
   - Should return: `{"status": "healthy"}`

2. **Check Frontend**:
   - Visit your Netlify URL
   - Should load the Archon UI

3. **Test Functionality**:
   - Try uploading a document
   - Test the knowledge base search
   - Verify WebSocket connections work

## Deployment Costs

### Free Tier Limits:

- **Netlify**: 100GB bandwidth/month, 300 build minutes
- **Railway**: $5 credit (lasts ~1 month for light usage)
- **Supabase**: 500MB database, 2GB bandwidth, 50MB file storage

### Estimated Monthly Costs (after free tiers):

- **Light usage**: $5-10/month
- **Medium usage**: $15-25/month
- **Heavy usage**: $30-50/month

## Troubleshooting

### Railway Issues

1. **Service won't start**:
   - Check logs in Railway dashboard
   - Verify environment variables are set
   - Ensure start command is correct

2. **Inter-service communication fails**:
   - Verify SERVICE_DISCOVERY_MODE=railway
   - Check service URLs in environment variables
   - Ensure all services are running

### Netlify Issues

1. **Build fails**:
   - Check build logs
   - Verify Node version (should be 20.x)
   - Ensure all dependencies are in package.json

2. **API calls fail**:
   - Verify VITE_API_URL is set correctly
   - Check netlify.toml redirects
   - Ensure backend is running

### WebSocket Issues

1. **Connection fails**:
   - Railway supports WebSockets by default
   - Netlify redirects should include WebSocket paths
   - Check CORS settings in backend

## Alternative Deployment Options

### For Backend:
- **Render.com**: Similar to Railway, good free tier
- **Fly.io**: Better for WebSocket-heavy apps
- **Google Cloud Run**: Serverless option
- **AWS EC2**: More control, more complex

### For Frontend:
- **Vercel**: Alternative to Netlify
- **Cloudflare Pages**: Fast global CDN
- **GitHub Pages**: Simple static hosting
- **AWS S3 + CloudFront**: Enterprise option

## Security Considerations

1. **Environment Variables**:
   - Never commit secrets to Git
   - Use Railway/Netlify secret management
   - Rotate keys regularly

2. **CORS Configuration**:
   - Update backend CORS settings for production URLs
   - Restrict to your Netlify domain

3. **Rate Limiting**:
   - Implement rate limiting in production
   - Monitor for abuse

4. **Database Security**:
   - Use Supabase Row Level Security (RLS)
   - Regular backups
   - Monitor usage

## Monitoring

1. **Railway Dashboard**:
   - View logs, metrics, deployments
   - Set up alerts for failures

2. **Netlify Analytics**:
   - Monitor traffic and performance
   - Track build times

3. **Supabase Dashboard**:
   - Database metrics
   - API usage
   - Storage usage

## Updating Your Deployment

To update after making changes:

1. **Backend (Railway)**:
   ```bash
   git push origin main
   ```
   Railway auto-deploys from GitHub

2. **Frontend (Netlify)**:
   ```bash
   git push origin main
   ```
   Netlify auto-deploys from GitHub

## Support

If you encounter issues:

1. Check the logs in Railway/Netlify dashboards
2. Verify all environment variables are set
3. Test each service individually
4. Check the GitHub issues: https://github.com/Archon-Inc/archon

## Next Steps

Once deployed, you can:

1. Set up custom domains
2. Configure SSL certificates (automatic on both platforms)
3. Set up monitoring and alerts
4. Implement CI/CD pipelines
5. Add authentication for production use