# FatSecret Proxy Server - Quick Setup Guide

## 1. Install Dependencies

```bash
cd fatsecret-proxy
npm install
```

## 2. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your FatSecret credentials:
```
FATSECRET_CLIENT_ID=15bc58d84bdf45be82185b164a051a05
FATSECRET_CLIENT_SECRET=1b876d7ccfb6438a9bc2772bea0cefb9
PORT=3000
```

## 3. Test Locally

```bash
npm start
```

Server runs on `http://localhost:3000`

Test endpoints:
- `http://localhost:3000/health` - Health check
- `http://localhost:3000/api/search?q=Starbucks%20latte` - Search test

## 4. Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? fatsecret-proxy
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add FATSECRET_CLIENT_ID
vercel env add FATSECRET_CLIENT_SECRET

# Redeploy with env vars
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com
2. Import your GitHub repository (or drag & drop the `fatsecret-proxy` folder)
3. Add environment variables in Settings → Environment Variables:
   - `FATSECRET_CLIENT_ID`
   - `FATSECRET_CLIENT_SECRET`
4. Deploy

## 5. Get Your Proxy URL

After deployment, Vercel will give you a URL like:
- `https://fatsecret-proxy.vercel.app`
- Or custom domain if configured

## 6. Whitelist Proxy Server IP

1. Get your Vercel server's IP:
   - Check Vercel dashboard → Settings → Domains
   - Or use a service like `api.ipify.org` (if your proxy logs its IP)
   - Vercel uses dynamic IPs, so you may need to whitelist their IP ranges

2. Add IP to FatSecret:
   - Go to https://platform.fatsecret.com/api/IPRestrictions
   - Add your server's IP address
   - Wait up to 24 hours for changes to take effect

**Note:** For Vercel, you may need to contact FatSecret support about whitelisting their IP ranges, or use a service like Railway/Render that provides static IPs.

## 7. Update iOS App

In `CalorieTracker/Config.swift`, update:

```swift
static let fatSecretProxyURL = "https://your-proxy-url.vercel.app"
```

Replace `your-proxy-url.vercel.app` with your actual Vercel URL.

## 8. Test

1. Run your iOS app
2. Try searching for "Starbucks Grande Latte"
3. Check Xcode console for proxy logs
4. Should see: `✅ FatSecret Proxy: Found X result(s)`

## Troubleshooting

**Proxy returns 403/401:**
- Check FatSecret IP whitelist
- Verify environment variables are set correctly
- Check proxy server logs

**Proxy returns 502/503:**
- Check if proxy server is running
- Verify Vercel deployment succeeded
- Check Vercel function logs

**iOS app can't connect:**
- Verify proxy URL in Config.swift
- Check network connectivity
- For local testing, ensure iOS simulator can reach `localhost:3000` (may need to use your Mac's IP instead)

