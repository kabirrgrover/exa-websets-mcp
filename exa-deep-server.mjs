import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const EXA_API_URL = "https://api.exa.ai/search";

const server = new McpServer({
  name: "exa-deep-search",
  version: "1.0.0",
});

server.tool(
  "exa_deep_search",
  "Perform a deep search using Exa AI. Supports structured outputs via outputSchema and returns field-level citations (grounding). Use type 'deep-reasoning' for complex queries requiring multi-step reasoning.",
  {
    query: z.string().describe("The search query"),
    type: z
      .enum(["deep", "deep-reasoning"])
      .default("deep")
      .describe("Search tier: 'deep' (default) or 'deep-reasoning' for complex queries"),
    outputSchema: z
      .record(z.any())
      .optional()
      .describe("JSON Schema for structured output. When provided, results include grounding citations."),
    additionalQueries: z
      .array(z.string())
      .max(5)
      .optional()
      .describe("Up to 5 query variations to broaden the search"),
    numResults: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Number of results to return"),
  },
  async ({ query, type, outputSchema, additionalQueries, numResults }) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: "Error: EXA_API_KEY environment variable is not set.",
          },
        ],
        isError: true,
      };
    }

    const body = {
      query,
      type: type || "deep",
    };

    if (outputSchema) body.outputSchema = outputSchema;
    if (additionalQueries) body.additionalQueries = additionalQueries;
    if (numResults) body.numResults = numResults;

    try {
      const response = await axios.post(EXA_API_URL, body, {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 120_000, // Deep searches can take a while
      });

      const data = response.data;

      // Build the result text
      const parts = [];

      if (outputSchema) {
        // Structured output mode: content is JSON + grounding citations
        if (data.output?.content) {
          parts.push("## Structured Output\n```json\n" + JSON.stringify(data.output.content, null, 2) + "\n```");
        }
        if (data.grounding) {
          parts.push("## Grounding (Citations)\n```json\n" + JSON.stringify(data.grounding, null, 2) + "\n```");
        }
      } else {
        // Plain text mode
        if (data.output?.content) {
          parts.push("## Output\n" + (typeof data.output.content === "string"
            ? data.output.content
            : JSON.stringify(data.output.content, null, 2)));
        }
      }

      // Include results array if present
      if (data.results && data.results.length > 0) {
        const resultsSummary = data.results.map((r, i) => {
          let entry = `${i + 1}. **${r.title || "Untitled"}**\n   URL: ${r.url || "N/A"}`;
          if (r.text) entry += `\n   ${r.text.substring(0, 300)}${r.text.length > 300 ? "..." : ""}`;
          return entry;
        }).join("\n\n");
        parts.push("## Sources\n" + resultsSummary);
      }

      const text = parts.length > 0 ? parts.join("\n\n") : JSON.stringify(data, null, 2);

      return {
        content: [{ type: "text", text }],
      };
    } catch (err) {
      const message = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      return {
        content: [{ type: "text", text: `Exa Deep Search error: ${message}` }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[exa-deep-server] MCP server running on stdio");
