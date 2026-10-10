import { Sprite } from './Sprite.jsx';

export function FoodCard({ food, index, selected, disabled, onToggle }) {
  return (
    <button
      type="button"
      className={`food-card${selected ? ' is-selected' : ''}`}
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onToggle(food)}
    >
      <span className="food-key">{index + 1}</span>
      <Sprite food={food} className="food-sprite" />
      <span className="food-copy">
        <strong>{food.name}</strong>
        <span>{Math.round(food.energy)} kcal</span>
      </span>
      <span className="food-protein">蛋白 {Number(food.protein).toFixed(1)}g</span>
      <span className="food-check" aria-hidden="true">{selected ? '−' : '+'}</span>
    </button>
  );
}
