import { describe, expect, it } from 'vitest';
import { normalizeNutritionResult } from './nutrition.js';

describe('MCP nutrition normalizer', () => {
  it('reads JSON text payloads with Chinese field names', () => {
    const result = {
      content: [{
        type: 'text',
        text: JSON.stringify({ data: [{ 餐品名称: '测试汉堡', 能量: '388 kcal', 蛋白质: '18.2 g', 脂肪: 17, 碳水化合物: 35, 钠: '720 mg' }] }),
      }],
    };
    expect(normalizeNutritionResult(result)).toEqual([{
      id: 'mcp-1',
      name: '测试汉堡',
      category: 'burger',
      energy: 388,
      protein: 18.2,
      fat: 17,
      carbs: 35,
      sodium: 720,
    }]);
  });

  it('ignores non-food wrapper objects', () => {
    expect(normalizeNutritionResult({ structuredContent: { status: 'ok', items: [] } })).toEqual([]);
  });

  it('reads the compact table format returned by the live nutrition tool', () => {
    const response = {
      content: [{
        type: 'text',
        text: '# API Response Information\n\n## Original Response\n\n'
          + JSON.stringify({
            success: true,
            data: '[2]{productName,nutritionDescription,energyKj,energyKcal,protein,fat,carbohydrate,sodium,calcium}:\n  猪柳麦满分,null,1288,308,16,16,24,781,213\n  中薯条,null,1210,289,4,12,38,165,18',
          }),
      }],
    };
    expect(normalizeNutritionResult(response)).toEqual([
      { id: 'mcp-1', name: '猪柳麦满分', category: 'burger', energy: 308, protein: 16, fat: 16, carbs: 24, sodium: 781 },
      { id: 'mcp-2', name: '中薯条', category: 'side', energy: 289, protein: 4, fat: 12, carbs: 38, sodium: 165 },
    ]);
  });
});
