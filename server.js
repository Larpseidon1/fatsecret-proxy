const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;
const FATSECRET_AUTH_URL = 'https://oauth.fatsecret.com/connect/token';
const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api';

// Token cache
let accessToken = null;
let tokenExpiry = null;

// CORS middleware (allow your iOS app)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Authenticate with FatSecret
async function authenticate() {
  // Check if token is still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  console.log('🔐 Authenticating with FatSecret...');
  
  if (!FATSECRET_CLIENT_ID || !FATSECRET_CLIENT_SECRET) {
    throw new Error('FatSecret credentials not configured');
  }
  
  const credentials = Buffer.from(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(FATSECRET_AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=basic'
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ FatSecret auth failed: ${response.status} ${error}`);
    throw new Error(`FatSecret auth failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Expire 60 seconds before actual expiry for safety
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  
  console.log(`✅ FatSecret authenticated successfully (expires in ${data.expires_in}s)`);
  return accessToken;
}

// Proxy endpoint: Search foods
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter "q"' });
    }

    console.log(`🔍 Proxy: Searching FatSecret for '${query}'`);
    const token = await authenticate();
    
    const params = new URLSearchParams({
      method: 'foods.search',
      search_expression: query,
      format: 'json'
    });

    const apiResponse = await fetch(`${FATSECRET_API_URL}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      console.error(`❌ FatSecret API error: ${apiResponse.status} ${error}`);
      return res.status(apiResponse.status).json({ 
        error: `FatSecret API error: ${error}` 
      });
    }

    const data = await apiResponse.json();
    console.log(`✅ Proxy: Found results for '${query}'`);
    res.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint: Get food details
app.get('/api/food/:foodId', async (req, res) => {
  try {
    const foodId = req.params.foodId;
    console.log(`📋 Proxy: Getting details for food ID '${foodId}'`);
    const token = await authenticate();
    
    const params = new URLSearchParams({
      method: 'food.get.v2',
      food_id: foodId,
      format: 'json'
    });

    const apiResponse = await fetch(`${FATSECRET_API_URL}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      console.error(`❌ FatSecret API error: ${apiResponse.status} ${error}`);
      return res.status(apiResponse.status).json({ 
        error: `FatSecret API error: ${error}` 
      });
    }

    const data = await apiResponse.json();
    console.log(`✅ Proxy: Retrieved details for food ID '${foodId}'`);
    res.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasToken: !!accessToken,
    tokenExpired: tokenExpiry ? Date.now() >= tokenExpiry : null,
    envConfigured: {
      clientId: !!FATSECRET_CLIENT_ID,
      clientSecret: !!FATSECRET_CLIENT_SECRET
    }
  });
});

// Test FatSecret connection
app.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing FatSecret connection...');
    const token = await authenticate();
    res.json({ 
      status: 'success', 
      message: 'FatSecret authentication successful',
      tokenLength: token.length
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      stack: error.stack
    });
  }
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces for Railway

app.listen(PORT, HOST, () => {
  console.log(`🚀 FatSecret Proxy Server running on ${HOST}:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET /api/search?q=<query>`);
  console.log(`   GET /api/food/:foodId`);
  console.log(`   GET /health`);
  console.log(`   GET /test`);
  console.log(`🔑 Environment check:`);
  console.log(`   CLIENT_ID configured: ${!!FATSECRET_CLIENT_ID} (length: ${FATSECRET_CLIENT_ID?.length || 0})`);
  console.log(`   CLIENT_SECRET configured: ${!!FATSECRET_CLIENT_SECRET} (length: ${FATSECRET_CLIENT_SECRET?.length || 0})`);
});

