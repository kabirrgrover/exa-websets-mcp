## What This Does
This MCP server acts as a unified gateway that lets you query Exa (for code search), Websets (for deep research), and Deep Search (for structured, citation-backed answers) through **any MCP client — including Poke AI, Cursor, and Windsurf.

It enables you to:
- **Search across custom collections** of websites simultaneously (vs. searching one site at a time)
- **Find real-time information** beyond training data (current news, market updates, new companies)
- **Access specialized databases** like Crunchbase, Pitchbook, and LinkedIn for verified business information
- **Monitor specific industries** or trends by searching relevant publications together
- **Verify contact information** across multiple sources for accuracy
- **Compile comprehensive research reports** by pulling from diverse authoritative sources
- **Conduct competitive analysis** by gathering data across company websites, news sources, and business directories

## Features
- **Unified Gateway**: Access all tools through a single Render deployment
- **Code Search**: Specialized Exa model for coding questions
- **Websets**: Deep research and list management
- **Deep Search**: Structured outputs with field-level citations and deep-reasoning support
- **Cloud Ready**: Deploy to Render with one click
- **Universal Compatibility**: Works with Poke, Cursor, Windsurf, and any standard MCP client

## Capabilities Reference
What this MCP server allows you to do:
- **Search across custom collections** of websites simultaneously (vs. searching one site at a time)
- **Find real-time information** beyond training data (current news, market updates, new companies)
- **Access specialized databases** like Crunchbase, Pitchbook, and LinkedIn for verified business information
- **Monitor specific industries** or trends by searching relevant publications together
- **Verify contact information** across multiple sources for accuracy
- **Compile comprehensive research reports** by pulling from diverse authoritative sources
- **Conduct competitive analysis** by gathering data across company websites, news sources, and business directories

## Quick Start
### Prerequisites
- Exa API Key
- An MCP Client (Poke, Cursor, Windsurf, etc.)
- Render account (free tier works)

### Option 1: Deploy to Render (Recommended)
1. Fork this repository.
2. Create a new Web Service on Render.
3. Connect your forked repository.
4. Set environment variables:
   - `EXA_API_KEY`: Your Exa API key
   - `PORT`: 8080 (optional, Render sets this automatically)
5. Get your MCP URL: `https://your-service-name.onrender.com`

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/kabirrgrover/exa-websets-mcp.git
   cd exa-websets-mcp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   Set `EXA_API_KEY` in your environment.
4. Run the server:
   ```bash
   npm start
   ```
   Server runs at: `http://localhost:8080`

## Client Configuration
To connect this server, use the URLs below. These work with **any** MCP-compliant client.

### 1. Websets (Research)
- **URL**: `https://your-service-name.onrender.com/websets/sse`
- **Use for**: Research, Lead Gen, Lists

### 2. Exa (Coding)
- **URL**: `https://your-service-name.onrender.com/mcp`
- **Use for**: Coding questions, Documentation search

### 3. Deep Search (Structured Answers)
- **URL**: `https://your-service-name.onrender.com/deep/sse`
- **Use for**: Structured outputs with citations, deep-reasoning queries

#### Example MCP Client Config
```json
{
  "mcpServers": {
    "exa-research": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-app.onrender.com/websets/sse"]
    },
    "exa-code": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-app.onrender.com/mcp"]
    },
    "exa-deep": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-app.onrender.com/deep/sse"]
    }
  }
}
```

## Troubleshooting
**"Invalid MCP server URL"**
- Verify your URL matches the endpoints above exactly.
- Ensure the server is live on Render (green status).

**"Authentication failed"**
- Verify `EXA_API_KEY` is set correctly in Render environment variables.

**Messages failing**
- If Poke cannot send messages, ensure you are using the correct endpoint (`/websets/sse` for Websets).

## Architecture
MCP Client <-> Gateway (Express) <-> [Exa MCP, Websets MCP, Deep Search MCP]

## License
MIT License
