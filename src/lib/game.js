export const MISSIONS = [
  {
    title: '热身编译',
    target: 600,
    tolerance: 90,
    protein: 20,
    sodium: 1800,
    copy: '把能量控制在目标区间，同时补够蛋白质。',
  },
  {
    title: '性能优化',
    target: 800,
    tolerance: 100,
    protein: 32,
    sodium: 2100,
    copy: '更高目标，更严约束。每一个选择都要有用。',
  },
  {
    title: '1024 终极栈',
    target: 1024,
    tolerance: 110,
    protein: 42,
    sodium: 2400,
    copy: '冲到 1024 千卡附近，构建你的巨无霸级方案。',
  },
];

export const sumNutrition = (items) => items.reduce(
  (total, item) => ({
    energy: total.energy + Number(item.energy || 0),
    protein: total.protein + Number(item.protein || 0),
    fat: total.fat + Number(item.fat || 0),
    carbs: total.carbs + Number(item.carbs || 0),
    sodium: total.sodium + Number(item.sodium || 0),
  }),
  { energy: 0, protein: 0, fat: 0, carbs: 0, sodium: 0 },
);

export function evaluateStack(items, mission, secondsLeft) {
  const nutrition = sumNutrition(items);
  const energyDelta = Math.abs(nutrition.energy - mission.target);
  const energyPoints = Math.max(0, 620 - energyDelta * 2.4);
  const proteinPoints = nutrition.protein >= mission.protein
    ? 260 + Math.min(90, nutrition.protein - mission.protein)
    : Math.max(0, nutrition.protein * 7);
  const sodiumPoints = nutrition.sodium <= mission.sodium
    ? 160
    : Math.max(0, 160 - (nutrition.sodium - mission.sodium) / 5);
  const speedPoints = Math.max(0, secondsLeft) * 4;
  const exactBonus = energyDelta <= 20 ? 200 : energyDelta <= mission.tolerance ? 80 : 0;
  const score = Math.round(energyPoints + proteinPoints + sodiumPoints + speedPoints + exactBonus);
  const passed = energyDelta <= mission.tolerance
    && nutrition.protein >= mission.protein
    && nutrition.sodium <= mission.sodium;

  return {
    nutrition,
    score,
    passed,
    energyDelta,
    notes: [
      energyDelta <= mission.tolerance ? '能量命中' : '能量偏离',
      nutrition.protein >= mission.protein ? '蛋白达标' : '蛋白不足',
      nutrition.sodium <= mission.sodium ? '钠值安全' : '钠值超标',
    ],
  };
}

export function createRoundFoods(foods, roundIndex) {
  if (foods.length <= 8) return foods;
  const offset = (roundIndex * 5) % foods.length;
  return Array.from({ length: 8 }, (_, index) => foods[(offset + index) % foods.length]);
}

export function spriteIndex(food) {
  const text = `${food.name} ${food.category}`.toLowerCase();
  if (/薯|fries|side/.test(text)) return 0;
  if (/饮|汽水|可乐|奶|coffee|drink/.test(text)) return 1;
  if (/鸡块|鸡翅|nugget/.test(text)) return 2;
  const energy = Number(food.energy || 0);
  if (energy > 650) return 8;
  if (energy > 520) return 7;
  if (energy > 430) return 5;
  if (energy > 340) return 4;
  return 3;
}
