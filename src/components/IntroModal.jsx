import { Sprite } from './Sprite.jsx';

export function IntroModal({ source, loading, onStart }) {
  return (
    <div className="modal-backdrop intro-backdrop" role="presentation">
      <section className="intro-modal" role="dialog" aria-modal="true" aria-labelledby="intro-title">
        <Sprite index={9} className="intro-mascot" />
        <p>REAL DATA. REAL CHOICES.</p>
        <h1 id="intro-title">把一顿饭<br />编译成 <span>1024</span></h1>
        <div className="intro-rule">
          <b>01</b><span>选择最多 4 件餐品</span>
          <b>02</b><span>命中能量、蛋白质与钠约束</span>
          <b>03</b><span>连续三轮，冲刺最高分</span>
        </div>
        <button className="primary-action intro-start" type="button" onClick={onStart} disabled={loading}>
          {loading ? '连接 MCP…' : source === 'mcp' ? '使用真实数据开局' : '先用试玩数据开局'}
        </button>
        <small>键盘 1—8 选餐 · Enter 提交 · R 重开</small>
      </section>
    </div>
  );
}
