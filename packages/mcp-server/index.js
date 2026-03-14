#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_KEY = process.env.FORGEHOUSE_API_KEY;
const BASE_URL = process.env.FORGEHOUSE_URL || "https://forgehouse.io";

// Skip API key check when imported as module (for Smithery scanning)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule && !API_KEY) {
  console.error("Error: FORGEHOUSE_API_KEY environment variable is required.");
  console.error("Get your API key at https://forgehouse.io/dashboard/api");
  process.exit(1);
}

async function fetchMentors() {
  const res = await fetch(`${BASE_URL}/api/v1/chat`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch mentors: ${res.status}`);
  const data = await res.json();
  return data.mentors;
}

async function chatWithMentor(mentor, message, conversationHistory = []) {
  const messages =
    conversationHistory.length > 0
      ? [...conversationHistory, { role: "user", content: message }]
      : [{ role: "user", content: message }];

  const res = await fetch(`${BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mentor,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.response;
}

const server = new McpServer({
  name: "ForgeHouse",
  version: "0.1.0",
});

// Tool: List available mentors
server.tool("list_mentors", "List all available ForgeHouse mentors", {}, async () => {
  try {
    const mentors = await fetchMentors();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(mentors, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

// Tool: Chat with a mentor
server.tool(
  "ask_mentor",
  "Ask a ForgeHouse mentor a question. Use for GTM strategy, sales, outbound, and business advice.",
  {
    mentor: z
      .string()
      .describe('Mentor slug (e.g., "colin-chapman")'),
    message: z
      .string()
      .describe("Your question or message to the mentor"),
    conversation: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      )
      .optional()
      .describe("Previous conversation messages for context"),
  },
  async ({ mentor, message, conversation }) => {
    try {
      const response = await chatWithMentor(mentor, message, conversation || []);
      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// Smithery sandbox scanning support
export function createSandboxServer() {
  return server;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Only auto-start when run directly
if (isMainModule) {
  main().catch((err) => {
    console.error("MCP server error:", err);
    process.exit(1);
  });
}
