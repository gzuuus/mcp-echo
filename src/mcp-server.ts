import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'Some Tools Server',
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

server.tool(
  'fetch-bitcoin-price',
  'Use this tool when you need real-time Bitcoin price information',
  {
    currency: z.string().optional().default('usd'),
  },
  async ({ currency }) => {
    console.info(`Processing bitcoin price fetch request for currency: ${currency}`);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      const bitcoinPrice = data.bitcoin[currency.toLowerCase()];
      return {
        content: [
          {
            type: 'text',
            text: `Current bitcoin price: ${bitcoinPrice.toLocaleString()} ${currency.toUpperCase()}`,
          },
        ],
      };
    } catch (error) {
      console.error('Bitcoin price fetch failed:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'fetch-block-height',
  'Use this tool when you need to know the latest block hight',
  async () => {
    console.info('Processing block height fetch request');
    try {
      const response = await fetch('https://mempool.space/api/blocks/tip/height');
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const blockHeight = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `Current Bitcoin block height: ${blockHeight.toLocaleString()}`,
          },
        ],
      };
    } catch (error) {
      console.error('Block height fetch failed:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  'fetch-mempool-fees',
  'Use this tool when you need to know current mempool fees.',
  async () => {
    console.info('Processing mempool fees fetch request');
    try {
      const response = await fetch('https://mempool.space/api/v1/fees/recommended');
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const fees = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `Recommended fees (sat/vB):
            High Priority (Next Block): ${fees.fastestFee}
            Medium Priority (~30 mins): ${fees.halfHourFee}
            Low Priority (~1 hour): ${fees.hourFee}`,
          },
        ],
      };
    } catch (error) {
      console.error('Mempool fees fetch failed:', error);
      return {
        content: [
          {
            type: 'text',
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
