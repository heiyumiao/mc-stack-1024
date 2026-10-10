import { useCallback, useEffect, useState } from 'react';
import { DEMO_FOODS } from '../lib/demoFoods.js';

export function useMenu() {
  const [foods, setFoods] = useState(DEMO_FOODS);
  const [source, setSource] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('正在连接麦当劳 MCP…');

  const load = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/menu${force ? '?refresh=1' : ''}`);
      const payload = await response.json();
      if (!response.ok || !Array.isArray(payload.foods)) throw new Error(payload.error || 'MCP 请求失败');
      setFoods(payload.foods);
      setSource('mcp');
      setMessage(`已载入 ${payload.foods.length} 项官方 MCP 营养数据`);
    } catch (error) {
      setFoods(DEMO_FOODS);
      setSource('demo');
      setMessage(`试玩数据：${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { foods, source, loading, message, refresh: () => load(true) };
}
