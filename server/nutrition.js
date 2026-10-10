const NAME_KEYS = ['name', 'foodName', 'productName', 'mealName', 'title', '餐品名称', '商品名称', '名称'];
const ENERGY_KEYS = ['energy', 'energyKcal', 'calories', 'kcal', '热量', '能量', '能量千卡'];
const PROTEIN_KEYS = ['protein', 'proteinG', '蛋白质'];
const FAT_KEYS = ['fat', 'fatG', '脂肪'];
const CARBS_KEYS = ['carbs', 'carbohydrate', 'carbohydrates', '碳水化合物', '碳水'];
const SODIUM_KEYS = ['sodium', 'sodiumMg', '钠'];

function firstValue(object, keys) {
  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null && object[key] !== '') return object[key];
  }
  return undefined;
}

function numberFrom(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const match = String(value ?? '').replaceAll(',', '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function collectObjects(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectObjects(item, output);
  } else if (value && typeof value === 'object') {
    output.push(value);
    for (const nested of Object.values(value)) collectObjects(nested, output);
  }
  return output;
}

function parseCompactTable(value) {
  if (typeof value !== 'string') return [];
  const clean = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const match = clean.match(/^\[\d+\]\{([^}]+)\}:\s*\n([\s\S]+)$/);
  if (!match) return [];
  const headers = match[1].split(',').map((header) => header.trim());
  return match[2]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const values = line.split(',');
      return Object.fromEntries(headers.map((header, index) => [header, values[index] === 'null' ? null : values[index]]));
    });
}

function parseTextPayload(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = Math.min(...['[', '{'].map((mark) => {
      const index = text.indexOf(mark);
      return index === -1 ? Number.POSITIVE_INFINITY : index;
    }));
    if (Number.isFinite(start)) {
      try {
        return JSON.parse(text.slice(start));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function categoryFromName(name) {
  if (/薯|玉米|苹果|沙拉/.test(name)) return 'side';
  if (/饮|可乐|汽水|咖啡|奶|茶/.test(name)) return 'drink';
  if (/鸡块|鸡翅/.test(name)) return 'nugget';
  return 'burger';
}

export function normalizeNutritionResult(result) {
  const payloads = [];
  if (result?.structuredContent) payloads.push(result.structuredContent);
  for (const block of result?.content ?? []) {
    if (block?.type === 'text' && block.text) {
      const parsed = parseTextPayload(block.text);
      if (parsed) payloads.push(parsed);
    }
  }

  const seen = new Set();
  const foods = [];
  const objects = collectObjects(payloads);
  for (const object of [...objects, ...objects.flatMap((item) => parseCompactTable(item.data))]) {
    const name = String(firstValue(object, NAME_KEYS) ?? '').trim();
    const energy = numberFrom(firstValue(object, ENERGY_KEYS));
    if (!name || energy <= 0 || seen.has(name)) continue;
    seen.add(name);
    foods.push({
      id: String(object.id ?? object.code ?? object.productCode ?? `mcp-${foods.length + 1}`),
      name,
      category: categoryFromName(name),
      energy,
      protein: numberFrom(firstValue(object, PROTEIN_KEYS)),
      fat: numberFrom(firstValue(object, FAT_KEYS)),
      carbs: numberFrom(firstValue(object, CARBS_KEYS)),
      sodium: numberFrom(firstValue(object, SODIUM_KEYS)),
    });
  }

  return foods.filter((food) => food.protein || food.fat || food.carbs || food.sodium);
}
