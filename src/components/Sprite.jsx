import { spriteIndex } from '../lib/game.js';

export function Sprite({ food, index, className = '' }) {
  const sprite = index ?? spriteIndex(food ?? {});
  const column = sprite % 4;
  const row = Math.floor(sprite / 4);
  return (
    <span
      aria-hidden="true"
      className={`sprite ${className}`}
      style={{ backgroundPosition: `${column * 33.333}% ${row * 50}%` }}
    />
  );
}
