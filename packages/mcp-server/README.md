# @forgehouse/mcp-server

MCP server for [ForgeHouse](https://forgehouse.io) AI mentors. Connect your agent (OpenClaw, Claude Code, Cursor, etc.) directly to world-class mentors.

## Setup

1. Subscribe at [forgehouse.io/pricing](https://forgehouse.io/pricing)
2. Get your API key from your dashboard
3. Install: `npm install -g @forgehouse/mcp-server`

## Configuration

### OpenClaw / Claude Code

Add to your MCP config:

```json
{
  "mcpServers": {
    "forgehouse": {
      "command": "forgehouse-mcp",
      "env": {
        "FORGEHOUSE_API_KEY": "fh_your_api_key_here"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "forgehouse": {
      "command": "npx",
      "args": ["@forgehouse/mcp-server"],
      "env": {
        "FORGEHOUSE_API_KEY": "fh_your_api_key_here"
      }
    }
  }
}
```

## Tools

### `list_mentors`
List all available ForgeHouse mentors.

### `ask_mentor`
Ask a mentor a question. Supports conversation history for multi-turn interactions.

Parameters:
- `mentor` (string): Mentor slug, e.g. `"colin-chapman"`
- `message` (string): Your question
- `conversation` (array, optional): Previous messages for context

## Example

```
> ask_mentor("colin-chapman", "I'm doing 400 cold emails a week with zero responses. What am I doing wrong?")
```

## Available Mentors

- **Colin Chapman** (`colin-chapman`) — 26 years in GTM & outbound sales. Specializes in sales strategy, pipeline building, and converting cold prospects.

More mentors coming soon.
