const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Internal ports for sub-services
const EXA_PORT = 3001;
const WEBSETS_PORT = 3002;

// --- Start Exa MCP Server (Existing) ---
// Runs on PORT 3001
const exaMcp = spawn('node', [
    path.join(__dirname, 'node_modules', 'exa-mcp-server', '.smithery', 'shttp', 'index.cjs')
], {
    env: { ...process.env, PORT: EXA_PORT },
    stdio: 'inherit'
});
console.log(`[Gateway] Started Exa MCP on port ${EXA_PORT}`);

// --- Start Websets MCP Server (New) ---
// Runs on PORT 3002 via mcp-proxy
// Command: npx mcp-proxy --port 3002 --sseEndpoint /sse --streamEndpoint /mcp -- node node_modules/exa-websets-mcp-server/build/index.js
const websetsMcp = spawn('npx', [
    'mcp-proxy',
    '--port', WEBSETS_PORT,
    '--sseEndpoint', '/sse',
    '--streamEndpoint', '/mcp',
    '--',
    'node',
    path.join(__dirname, 'node_modules', 'exa-websets-mcp-server', 'build', 'index.js')
], {
    env: { ...process.env },
    stdio: 'inherit'
});
console.log(`[Gateway] Started Websets MCP on port ${WEBSETS_PORT}`);

// --- Proxy Routes ---

// 1. Exa MCP Routes
// Exa's shttp server mounts at /mcp
app.use('/mcp', createProxyMiddleware({
    target: `http://localhost:${EXA_PORT}`,
    changeOrigin: true,
    ws: true, // Proxy websockets if any
}));

// 2. Websets MCP Routes
// We mount everything under /websets/
// Clients should connect to /websets/sse
// And POST to /websets/mcp
app.use('/websets', createProxyMiddleware({
    target: `http://localhost:${WEBSETS_PORT}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/websets': '', // Strip /websets prefix when sending to internal server
    },
}));

// Health check
app.get('/', (req, res) => {
    res.send('Exa + Websets MCP Gateway is running.');
});

app.listen(PORT, () => {
    console.log(`[Gateway] Main server server listening on port ${PORT}`);
    console.log(`[Gateway] Exa MCP available at: /mcp`);
    console.log(`[Gateway] Websets MCP available at: /websets/sse (SSE) and /websets/mcp (POST)`);
});

// Cleanup on exit
process.on('SIGTERM', () => {
    exaMcp.kill();
    websetsMcp.kill();
    process.exit();
});
