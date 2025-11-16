# Deploy to Railway - Step by Step

## Option 1: Deploy via Railway Dashboard (Recommended - Easiest)

### Step 1: In Railway Dashboard
1. You're already at "New Project"
2. Click **"Empty Project"**

### Step 2: Add Service
1. After project is created, click **"+ New"**
2. Select **"Empty Service"**
3. Name it: `fatsecret-proxy`

### Step 3: Add Environment Variables
1. Click on the service you just created
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add:
   - `FATSECRET_CLIENT_ID` = `15bc58d84bdf45be82185b164a051a05`
   - `FATSECRET_CLIENT_SECRET` = `1b876d7ccfb6438a9bc2772bea0cefb9`
   - `PORT` = `3000` (Railway will override this, but good to have)

### Step 4: Deploy the Code
1. In the service, go to **"Settings"** tab
2. Scroll to **"Source"**
3. Click **"Connect Repository"** → **"Configure GitHub App"**
4. OR click **"Deploy from local directory"** if available

**Since we don't have GitHub set up yet, use this approach:**

1. Go back to the Railway dashboard
2. In your terminal (separate from this), run:
   ```bash
   cd /Users/parker/calorie-tracker-app/fatsecret-proxy
   # Upload via Railway CLI (requires manual login)
   ```

### Step 5: Generate Domain
1. In your service, go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy the domain (e.g., `fatsecret-proxy-production.up.railway.app`)

### Step 6: Get Static IP
1. In **"Settings"** → **"Networking"**
2. Look for **"Public Networking"** section
3. You'll see the static IP address
4. Copy it

### Step 7: Whitelist IP in FatSecret
1. Go to: https://platform.fatsecret.com/api/IPRestrictions
2. Remove your home IP: `95.164.86.179`
3. Add the Railway static IP
4. Save and wait 5-30 minutes

### Step 8: Update iOS App
In `CalorieTracker/Config.swift`, change:
```swift
static let fatSecretProxyURL = "https://your-railway-domain.up.railway.app"
```

---

## Option 2: Deploy via GitHub (Better for Updates)

### Step 1: Create GitHub Repo
```bash
cd /Users/parker/calorie-tracker-app/fatsecret-proxy
git init
git add .
git commit -m "Initial commit - FatSecret proxy server"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/fatsecret-proxy.git
git push -u origin main
```

### Step 2: In Railway Dashboard
1. Click **"GitHub Repository"** instead of Empty Project
2. Select your `fatsecret-proxy` repository
3. Railway auto-detects Node.js and deploys

### Step 3-8: Same as Option 1 above

---

## Troubleshooting

**Can't find static IP:**
- Railway provides static IPs automatically on all services
- Look in Settings → Networking → Public Networking
- If not visible, the service might still be deploying

**Deployment failed:**
- Check the deployment logs in Railway dashboard
- Ensure `package.json` has the correct `start` script
- Verify environment variables are set

**Health check fails:**
- Give it 2-3 minutes after deployment
- Check logs for errors
- Verify PORT is being read correctly

---

## Quick Test After Deployment

```bash
# Test health endpoint
curl https://your-railway-domain.up.railway.app/health

# Test search endpoint
curl "https://your-railway-domain.up.railway.app/api/search?q=Starbucks%20latte"
```

