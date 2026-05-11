const express = require('express');
const cors = require('cors');
const httpProxy = require('http-proxy-middleware');
const authRoutes = require('./routes/authRoutes');  // ← FIXED PATH

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Proxy to JSON Server (3001)
app.use('/api', httpProxy.createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true
}));

// Auth routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend: http://localhost:${PORT}`);
  console.log(`📊 JSON Server proxy: http://localhost:${PORT}/api`);
});