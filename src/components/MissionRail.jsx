export function MissionRail({ mission, roundIndex, totalRounds, source, message, loading, onRefresh }) {
  return (
    <aside className="mission-rail" aria-label="当前任务">
      <div className="mission-heading">
        <span className="mission-number">0{roundIndex + 1}</span>
        <div>
          <p>ROUND {roundIndex + 1} / {totalRounds}</p>
          <h2>{mission.title}</h2>
        </div>
      </div>

      <p className="mission-copy">{mission.copy}</p>

      <dl className="mission-specs">
        <div>
          <dt>目标能量</dt>
          <dd>{mission.target}<small>±{mission.tolerance} kcal</small></dd>
        </div>
        <div>
          <dt>蛋白下限</dt>
          <dd>{mission.protein}<small>g 以上</small></dd>
        </div>
        <div>
          <dt>钠上限</dt>
          <dd>{mission.sodium}<small>mg 以内</small></dd>
        </div>
      </dl>

      <div className={`source-panel source-${source}`}>
        <span className="source-dot" />
        <div>
          <strong>{source === 'mcp' ? 'MCP LIVE' : source === 'loading' ? 'CONNECTING' : 'DEMO MODE'}</strong>
          <p>{message}</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} aria-label="刷新 MCP 数据">
          ↻
        </button>
      </div>
    </aside>
  );
}
