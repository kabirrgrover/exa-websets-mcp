const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Internal ports for sub-services (using high ports to avoid conflicts)
const EXA_PORT = 13001;
const WEBSETS_PORT = 13002;

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
const mcpProxyBin = path.join(__dirname, 'node_modules', '.bin', 'mcp-proxy');
const websetsScript = path.join(__dirname, 'node_modules', 'exa-websets-mcp-server', 'build', 'index.js');

const websetsMcp = spawn(mcpProxyBin, [
    '--port', WEBSETS_PORT,
    '--sseEndpoint', '/websets/sse',
    '--streamEndpoint', '/websets/mcp',
    '--',
    'node',
    websetsScript
], {
    env: { ...process.env },
    stdio: 'pipe' // Capture stdio for logging
});

websetsMcp.stdout.on('data', (data) => {
    console.log(`[Websets:3002] ${data.toString().trim()}`);
});
websetsMcp.stderr.on('data', (data) => {
    console.error(`[Websets:3002] ${data.toString().trim()}`);
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
// Proxy forwards the full path (e.g. /websets/sse) to mcp-proxy, which is now looking for that exact path.
app.use('/websets', createProxyMiddleware({
    target: `http://localhost:${WEBSETS_PORT}`,
    changeOrigin: true,
    ws: true
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
