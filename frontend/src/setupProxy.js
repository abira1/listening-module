const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all /api requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
        console.error('[Proxy] Request:', req.method, req.path);
        res.status(500).json({ error: 'Proxy error', message: err.message });
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log outgoing requests
        console.log(`[Proxy Request] ${req.method} ${req.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log proxy responses for debugging
        console.log(`[Proxy Response] ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
      },
    })
  );
};

