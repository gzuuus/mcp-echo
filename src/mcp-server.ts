import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'Echo Server',
  version: '1.0.0',
});

server.tool(
  'echo',
  'Echoes back the provided text',
  {
    text: z.string(),
  },
  async ({ text }) => {
    console.info(`Processing echo request for: ${text}`);

    try {
      return {
        content: [
          {
            type: 'text' as const,
            text: text,
          },
        ],
      };
    } catch (error) {
      console.error('Echo failed:', error);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
