function Meter({ label, value, target, unit, variant = 'normal' }) {
  const percent = Math.min(100, (value / Math.max(target, 1)) * 100);
  return (
    <div className={`meter meter-${variant}`}>
      <div className="meter-label">
        <span>{label}</span>
        <strong>{Math.round(value)}<small>{unit}</small></strong>
      </div>
      <div className="meter-track"><span style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

export function NutritionPanel({ nutrition, mission }) {
  const energyDiff = nutrition.energy - mission.target;
  return (
    <section className="nutrition-panel" aria-live="polite">
      <div className="energy-readout">
        <span>当前能量</span>
        <strong>{Math.round(nutrition.energy)}</strong>
        <small>kcal</small>
        <em className={Math.abs(energyDiff) <= mission.tolerance ? 'good' : ''}>
          {energyDiff === 0 ? '完美命中' : `${energyDiff > 0 ? '+' : ''}${Math.round(energyDiff)}`}
        </em>
      </div>
      <div className="meters">
        <Meter label="蛋白质" value={nutrition.protein} target={mission.protein} unit="g" variant="protein" />
        <Meter label="钠" value={nutrition.sodium} target={mission.sodium} unit="mg" variant={nutrition.sodium > mission.sodium ? 'danger' : 'sodium'} />
        <Meter label="碳水" value={nutrition.carbs} target={120} unit="g" variant="carbs" />
      </div>
    </section>
  );
}
