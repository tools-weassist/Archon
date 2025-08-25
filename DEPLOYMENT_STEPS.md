# Archon Cloud Deployment - Step by Step

Your code is now on GitHub! Follow these steps to deploy to the cloud.

## Step 1: Set up Railway (Backend) ✅

### 1. Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub (use the same account with your Archon repo)

### 2. Deploy the Main Server
1. Click "New Project" → "Deploy from GitHub repo"
2. Select `tools-weassist/Archon`
3. Railway will detect the Python app
4. Click on the service card that appears
5. Go to "Settings" tab:
   - Rename service to `archon-server`
   - In "Deploy" section, set Start Command:
     ```
     cd python && python -m uvicorn src.server.main:socket_app --host 0.0.0.0 --port $PORT
     ```

### 3. Add Environment Variables
1. Go to "Variables" tab
2. Click "Raw Editor" and paste:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
OPENAI_API_KEY=your_openai_api_key_here
SERVICE_DISCOVERY_MODE=railway
LOG_LEVEL=INFO
RAILWAY_ENVIRONMENT=production
```

### 4. Deploy Additional Services
You need to create 2 more services for MCP and Agents:

#### MCP Server:
1. In Railway dashboard, click "New" → "GitHub Repo"
2. Select `tools-weassist/Archon` again
3. Rename to `archon-mcp`
4. Set Start Command:
   ```
   cd python && python -m uvicorn src.mcp.server:app --host 0.0.0.0 --port $PORT
   ```
5. Add the same environment variables

#### Agents Service:
1. Click "New" → "GitHub Repo"
2. Select `tools-weassist/Archon` again
3. Rename to `archon-agents`
4. Set Start Command:
   ```
   cd python && python -m uvicorn src.agents.server:app --host 0.0.0.0 --port $PORT
   ```
5. Add the same environment variables

### 5. Get Your Railway URLs
Each service will have a public URL. Click on each service and go to "Settings" → "Domains":
1. Click "Generate Domain" for each service
2. Note down the URLs:
   - archon-server: `https://archon-server-production-xxxx.up.railway.app`
   - archon-mcp: `https://archon-mcp-production-xxxx.up.railway.app`
   - archon-agents: `https://archon-agents-production-xxxx.up.railway.app`

### 6. Update Inter-Service Communication
For each service, add these additional environment variables:

**For archon-server:**
```env
ARCHON_MCP_URL=https://archon-mcp-production-xxxx.up.railway.app
ARCHON_AGENTS_URL=https://archon-agents-production-xxxx.up.railway.app
```

**For archon-mcp:**
```env
API_SERVICE_URL=https://archon-server-production-xxxx.up.railway.app
AGENTS_SERVICE_URL=https://archon-agents-production-xxxx.up.railway.app
```

**For archon-agents:**
```env
API_SERVICE_URL=https://archon-server-production-xxxx.up.railway.app
MCP_SERVICE_URL=https://archon-mcp-production-xxxx.up.railway.app
```

## Step 2: Set up Netlify (Frontend) 🌐

### 1. Create Netlify Account
1. Go to https://app.netlify.com/signup
2. Sign in with GitHub

### 2. Deploy from GitHub
1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Select `tools-weassist/Archon`

### 3. Configure Build Settings
Set these exact values:
- **Base directory**: `archon-ui-main`
- **Build command**: `npm run build`
- **Publish directory**: `archon-ui-main/dist`

### 4. Add Environment Variables
Before clicking "Deploy site", click "Show advanced":
1. Click "New variable"
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Railway archon-server URL (e.g., `https://archon-server-production-xxxx.up.railway.app`)

### 5. Deploy
Click "Deploy site" and wait for the build to complete (3-5 minutes)

### 6. Update the Redirects
After first deployment:
1. Go to your Netlify site settings
2. Find your site name (like `amazing-einstein-123abc`)
3. Update `archon-ui-main/netlify.toml` in your repo:
```toml
[[redirects]]
  from = "/api/*"
  to = "YOUR_RAILWAY_SERVER_URL/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/socket.io/*"
  to = "YOUR_RAILWAY_SERVER_URL/socket.io/:splat"
  status = 200
  force = true
```
4. Commit and push to trigger redeploy

## Step 3: Verify Everything Works ✅

### 1. Check Backend Health
Visit these URLs in your browser:
- `https://archon-server-production-xxxx.up.railway.app/health`
- `https://archon-mcp-production-xxxx.up.railway.app/health`
- `https://archon-agents-production-xxxx.up.railway.app/health`

All should return: `{"status":"healthy"}`

### 2. Check Frontend
1. Visit your Netlify URL (shown in Netlify dashboard)
2. The Archon UI should load
3. Check browser console for any errors (F12)

### 3. Test Features
1. Try uploading a document
2. Test search functionality
3. Check if WebSocket connections work (real-time updates)

## Troubleshooting Tips

### If Railway build fails:
- Check the build logs in Railway dashboard
- Ensure Python version is 3.12
- Verify all environment variables are set

### If Netlify build fails:
- Check build logs in Netlify dashboard
- Ensure Node version is 20.x
- Verify VITE_API_URL is set correctly

### If API calls fail from frontend:
- Check browser console for CORS errors
- Verify the API URL in Netlify environment variables
- Ensure Railway backend is running

## Need Help?
- Railway Discord: https://discord.gg/railway
- Netlify Community: https://answers.netlify.com
- Your repo issues: https://github.com/tools-weassist/Archon/issues

## Costs Reminder
- Railway: Free $5 credit, then ~$5-10/month
- Netlify: Free tier is usually sufficient
- Supabase: Free tier includes 500MB database

## Next Steps After Deployment
1. Set up a custom domain (optional)
2. Enable auto-deploy on git push (usually enabled by default)
3. Set up monitoring/alerts
4. Share your app URL with others!