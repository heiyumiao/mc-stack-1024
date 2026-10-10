import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchNutritionFoods } from './mcdMcpClient.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dirname, '..');
const cache = { foods: null, at: 0 };
const CACHE_TTL = 10 * 60 * 1000;

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, mcpConfigured: Boolean(process.env.MCD_MCP_TOKEN) });
});

app.get('/api/menu', async (request, response) => {
  try {
    const force = request.query.refresh === '1';
    if (!force && cache.foods && Date.now() - cache.at < CACHE_TTL) {
      return response.json({ source: 'mcp', cached: true, foods: cache.foods });
    }
    const foods = await fetchNutritionFoods({
      token: process.env.MCD_MCP_TOKEN,
      url: process.env.MCD_MCP_URL,
    });
    cache.foods = foods;
    cache.at = Date.now();
    return response.json({ source: 'mcp', cached: false, foods });
  } catch (error) {
    const status = /not configured/i.test(error.message) ? 503 : 502;
    return response.status(status).json({
      source: 'unavailable',
      error: error.message,
    });
  }
});

const dist = path.join(projectRoot, 'dist');
app.use(express.static(dist));
app.use((_request, response, next) => {
  response.sendFile(path.join(dist, 'index.html'), (error) => {
    if (error) next();
  });
});

app.listen(port, () => {
  console.log(`McStack server listening on http://localhost:${port}`);
});
