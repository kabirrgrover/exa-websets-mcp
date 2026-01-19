# Exa Websets MCP Server

## What This Does
This MCP server acts as a unified gateway that lets you query both Exa (for code search) and Websets (for deep research) through Poke AI assistant or any MCP client.

- "Find me a Python library for..." - Uses Exa Code Search
- "Research the top 5 competitors for..." - Uses Websets for deep research
- "Create a list of leads..." - Uses Websets to build persistent lists

## Features
- Unified Gateway: Access both tools through a single Render deployment
- Code Search: specialized Exa model for coding questions
- Websets: Deep research and list management
- Cloud Ready: Deploy to Render with one click
- Poke Compatible: Works out of the box with Poke AI

## Quick Start
### Prerequisites
- Exa API Key
- Poke account (for AI assistant integration)
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
   git clone https://github.com/kabirrgrover/exa-websets-mcp-poke.git
   cd exa-websets-mcp-poke
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

## Poke Configuration
To connect this server to Poke, you need to add two separate integrations if you want both capabilities.

### 1. Websets (Research)
- **URL**: `https://your-service-name.onrender.com/websets/sse`
- **Use for**: Research, Lead Gen, Lists

### 2. Exa (Coding)
- **URL**: `https://your-service-name.onrender.com/mcp`
- **Use for**: Coding questions, Documentation search

## Troubleshooting
**"Invalid MCP server URL"**
- Verify your URL matches the endpoints above exactly.
- Ensure the server is live on Render (green status).

**"Authentication failed"**
- Verify `EXA_API_KEY` is set correctly in Render environment variables.

**Messages failing**
- If Poke cannot send messages, ensure you are using the correct endpoint (`/websets/sse` for Websets).

## Architecture
Poke AI <-> Gateway (Express) <-> [Exa MCP, Websets MCP]

## License
MIT License
