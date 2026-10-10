import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { normalizeNutritionResult } from './nutrition.js';

const DEFAULT_URL = 'https://mcp.mcd.cn';

export async function fetchNutritionFoods({ token, url = DEFAULT_URL }) {
  if (!token) throw new Error('MCD_MCP_TOKEN is not configured');

  const client = new Client(
    { name: 'mc-stack-1024', version: '1.0.0' },
    { versionNegotiation: { mode: 'legacy' } },
  );
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: 'list-nutrition-foods',
      arguments: {},
    });
    const foods = normalizeNutritionResult(result);
    if (foods.length < 4) throw new Error('MCP response did not contain enough nutrition foods');
    return foods;
  } finally {
    await client.close().catch(() => {});
  }
}
