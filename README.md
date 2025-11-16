# FatSecret API Proxy Server

Proxy server to handle FatSecret API OAuth 2.0 authentication and IP whitelisting for mobile apps.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env` file and add your FatSecret credentials
- Or set them in your hosting platform (Vercel, Railway, etc.)

## Local Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

- `GET /api/search?q=<query>` - Search for foods
- `GET /api/food/:foodId` - Get food details by ID
- `GET /health` - Health check

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard:
   - `FATSECRET_CLIENT_ID`
   - `FATSECRET_CLIENT_SECRET`
4. Get your proxy URL (e.g., `https://fatsecret-proxy.vercel.app`)

### Railway

1. Connect your GitHub repo
2. Add environment variables in Railway dashboard
3. Deploy automatically

## IP Whitelisting

After deployment:
1. Get your server's IP address (check hosting platform)
2. Add it to FatSecret IP Restrictions: https://platform.fatsecret.com/api/IPRestrictions
3. Wait up to 24 hours for changes to take effect

## Notes

- OAuth tokens are cached and automatically refreshed
- CORS is enabled for all origins (restrict in production if needed)
- Server handles token expiration automatically

