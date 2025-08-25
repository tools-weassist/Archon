// Express server with proper proxy for Railway production
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3737;

// Get the backend API URL from environment variable
const API_URL = process.env.VITE_API_URL || 'https://archon-production-a3dd.up.railway.app';

console.log(`Frontend server starting...`);
console.log(`API URL: ${API_URL}`);

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying API request: ${req.method} ${req.url} -> ${API_URL}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Proxy Socket.IO
app.use('/socket.io', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  ws: true,
  secure: true,
  logLevel: 'debug'
}));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Proxying API requests to: ${API_URL}`);
});