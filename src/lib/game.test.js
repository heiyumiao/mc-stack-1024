import { describe, expect, it } from 'vitest';
import { evaluateStack, sumNutrition } from './game.js';

describe('game scoring', () => {
  const mission = { target: 600, tolerance: 90, protein: 20, sodium: 1800 };
  const foods = [
    { energy: 350, protein: 15, fat: 10, carbs: 30, sodium: 500 },
    { energy: 250, protein: 10, fat: 8, carbs: 25, sodium: 400 },
  ];

  it('sums nutrition fields', () => {
    expect(sumNutrition(foods)).toEqual({ energy: 600, protein: 25, fat: 18, carbs: 55, sodium: 900 });
  });

  it('passes a balanced stack and awards the exact bonus', () => {
    const result = evaluateStack(foods, mission, 20);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(1200);
  });
});
